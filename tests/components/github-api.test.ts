import { Octokit } from '@octokit/rest';
import { App, Notice } from 'obsidian';

import GitHubWikiSyncPlugin from '../../main';

// Mock Octokit
jest.mock('@octokit/rest');

// Mock Obsidian components
jest.mock('obsidian', () => {
  const original = jest.requireActual('../__mocks__/obsidian.ts');
  return {
    ...original,
    Notice: jest.fn().mockImplementation(message => {
      return { message };
    }),
  };
});

describe('GitHub API Component Tests', () => {
  let app: App;
  let plugin: GitHubWikiSyncPlugin;
  let mockOctokit: jest.Mocked<Octokit>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mock app
    app = new App();

    // Set up plugin
    plugin = new GitHubWikiSyncPlugin(app, '');
    plugin.statusBarItem = { setText: jest.fn() } as any;
    plugin.updateStatusBarItem = jest.fn();

    // Configure plugin settings
    plugin.settings = {
      githubToken: 'mock-token',
      githubUsername: 'testuser',
      repositoryName: 'testrepo',
      wikiPath: 'wiki',
      syncOnSave: false,
      syncInterval: 0,
      lastSyncTimestamp: 0,
    };

    // Set up mock Octokit instance
    mockOctokit = {
      rest: {
        git: {
          getTree: jest.fn().mockResolvedValue({
            data: {
              tree: [
                { path: 'Test.md', sha: 'abcdef' },
                { path: 'Subfolder/Nested.md', sha: '123456' },
              ],
            },
          }),
        },
        repos: {
          getContent: jest.fn().mockResolvedValue({
            data: {
              content: Buffer.from('# Test Content').toString('base64'),
              sha: 'abcdef',
            },
          }),
          createOrUpdateFileContents: jest.fn().mockResolvedValue({
            data: {
              content: {
                sha: 'newsha',
              },
            },
          }),
        },
      },
    } as unknown as jest.Mocked<Octokit>;

    // Set the mocked Octokit
    (Octokit as unknown as jest.Mock).mockReturnValue(mockOctokit);

    // Initialize plugin with mocked Octokit
    plugin.initializeGitHub();
  });

  test('getWikiPages formats tree data correctly', async () => {
    const pages = await plugin.getWikiPages();

    // Check that the API was called correctly
    expect(mockOctokit.rest.git.getTree).toHaveBeenCalledWith({
      owner: 'testuser',
      repo: 'testrepo.wiki',
      tree_sha: 'master',
      recursive: '1',
    });

    // Check response structure
    expect(pages).toHaveLength(2);
    expect(pages[0].name).toBe('Test');
    expect(pages[0].path).toBe('Test.md');
    expect(pages[0].sha).toBe('abcdef');

    // Check that nested paths are handled correctly
    expect(pages[1].name).toBe('Subfolder/Nested');
    expect(pages[1].path).toBe('Subfolder/Nested.md');
  });

  test('getWikiPageContent fetches and decodes content', async () => {
    const content = await plugin.getWikiPageContent('Test');

    // Check API call
    expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
      owner: 'testuser',
      repo: 'testrepo.wiki',
      path: 'Test.md',
    });

    // Check that content was decoded correctly
    expect(content).toBe('# Test Content');
  });

  test("updateWikiPage creates a new file when it doesn't exist", async () => {
    // Mock getContent to throw 404
    mockOctokit.rest.repos.getContent.mockRejectedValueOnce({
      status: 404,
      message: 'Not found',
    });

    await plugin.updateWikiPage('NewPage', '# New Page Content');

    // Check createOrUpdateFileContents was called without a SHA
    expect(mockOctokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'testuser',
        repo: 'testrepo.wiki',
        path: 'NewPage.md',
        message: expect.stringContaining('Create NewPage'),
        content: expect.any(String),
      })
    );

    // Make sure SHA wasn't included
    const callArgs = mockOctokit.rest.repos.createOrUpdateFileContents.mock.calls[0][0];
    expect(callArgs).not.toHaveProperty('sha');
  });

  test('updateWikiPage updates existing file with SHA', async () => {
    // First call already mocked to return a file

    await plugin.updateWikiPage('Test', '# Updated Content');

    // Check update was called with SHA
    expect(mockOctokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'testuser',
        repo: 'testrepo.wiki',
        path: 'Test.md',
        message: expect.stringContaining('Update Test'),
        content: expect.any(String),
        sha: 'abcdef',
      })
    );
  });

  test('handles errors gracefully', async () => {
    // Mock API error
    mockOctokit.rest.git.getTree.mockRejectedValueOnce(new Error('API Error'));

    // Call method and expect error to be caught
    await plugin.pullFromGitHub();

    // Check error was shown in Notice
    expect(Notice).toHaveBeenCalledWith(expect.stringContaining('Failed to pull from GitHub Wiki'));

    // Status bar should be updated
    expect(plugin.statusBarItem.setText).toHaveBeenCalledWith('GitHub Wiki: Pulling...');
    expect(plugin.updateStatusBarItem).toHaveBeenCalledWith('Pull failed');
  });
});
