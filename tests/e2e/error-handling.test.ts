/**
 * End-to-End tests for error handling in the GitHub Wiki Sync Plugin
 */

import { Notice } from 'obsidian';

import { E2ETestEnvironment, createStandardE2EEnvironment } from './setup';

// Mock Notice class and console.error
jest.mock('obsidian', () => {
  const original = jest.requireActual('../__mocks__/obsidian.ts');
  return {
    ...original,
    Notice: jest.fn().mockImplementation(message => {
      return { message };
    }),
  };
});

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('GitHub Wiki Sync E2E Error Handling', () => {
  let env: E2ETestEnvironment;

  beforeEach(() => {
    // Set up a fresh environment before each test
    env = createStandardE2EEnvironment();

    // Clear mock calls
    (Notice as jest.Mock).mockClear();
  });

  afterEach(() => {
    // Clean up after each test
    env.reset();
  });

  test('Handles API errors when getting wiki pages', async () => {
    // Mock getTree to throw an error
    const getTree = env.plugin.octokit?.rest.git.getTree as jest.Mock;
    getTree.mockRejectedValueOnce(new Error('API Error: Unable to list wiki pages'));

    // Attempt to pull from GitHub
    await env.performPull();

    // Should show error notice
    expect(Notice).toHaveBeenCalledWith(expect.stringContaining('Failed to pull from GitHub Wiki'));

    // Status bar should be updated
    expect(env.plugin.statusBarItem.setText).toHaveBeenCalledWith('GitHub Wiki: Pulling...');
    expect(env.plugin.updateStatusBarItem).toHaveBeenCalledWith('Pull failed');
  });

  test('Handles API errors when getting page content', async () => {
    // Mock getContent to throw an error for a specific file
    const getContent = env.plugin.octokit?.rest.repos.getContent as jest.Mock;

    // Make only one specific file fail
    const originalImplementation = getContent.getMockImplementation();
    getContent.mockImplementation(async params => {
      if (params.path === 'Setup.md') {
        throw new Error('API Error: Unable to get content');
      }
      return originalImplementation(params);
    });

    // Attempt to pull from GitHub
    await env.performPull();

    // Should still pull other files successfully
    expect(env.getLocalFile('wiki/Home.md')).toBe('# Wiki Home\nWelcome to the test wiki!');
    expect(env.getLocalFile('wiki/Features.md')).toBe('# Features\n- Feature 1\n- Feature 2');

    // But not the failed file
    expect(env.getLocalFile('wiki/Setup.md')).toBeNull();

    // Should show pull complete notice (even with partial failure)
    expect(Notice).toHaveBeenCalledWith(
      expect.stringContaining('Pulled 0 updated pages from GitHub Wiki')
    );
  });

  test('Handles API errors when updating page content', async () => {
    // Add a local file to be pushed
    env.addLocalFile('wiki/NewPage.md', '# New Page\nThis is a new page created locally');

    // Mock createOrUpdateFileContents to throw an error
    const updateFile = env.plugin.octokit?.rest.repos.createOrUpdateFileContents as jest.Mock;
    updateFile.mockRejectedValueOnce(new Error('API Error: Unable to update content'));

    // Attempt to push to GitHub
    await env.performPush();

    // Should show error notice
    expect(Notice).toHaveBeenCalledWith(
      expect.stringContaining('Pushed 0 updated pages to GitHub Wiki')
    );

    // Remote should not have the new file
    expect(env.getRemoteFile('NewPage.md')).toBeNull();
  });

  test('Handles invalid or empty GitHub token', async () => {
    // Set empty token
    env.plugin.settings.githubToken = '';

    // Re-initialize GitHub
    env.plugin.initializeGitHub();

    // Attempt to sync
    await env.performFullSync();

    // Should show configuration notice
    expect(Notice).toHaveBeenCalledWith('Please configure GitHub token in settings');

    // Octokit should be null
    expect(env.plugin.octokit).toBeNull();
  });

  test('Handles network errors during sync', async () => {
    // Mock network error
    const getTree = env.plugin.octokit?.rest.git.getTree as jest.Mock;
    const networkError = new Error('Network Error');
    (networkError as any).isAxiosError = true;
    (networkError as any).message = 'Network Error';
    getTree.mockRejectedValueOnce(networkError);

    // Attempt to sync
    await env.performFullSync();

    // Should show error notice
    expect(Notice).toHaveBeenCalledWith(expect.stringContaining('Failed to sync with GitHub Wiki'));

    // Status should be updated
    expect(env.plugin.updateStatusBarItem).toHaveBeenCalledWith('Sync failed');
  });

  test('Handles rate limit errors', async () => {
    // Mock rate limit error
    const getTree = env.plugin.octokit?.rest.git.getTree as jest.Mock;
    const rateLimitError = new Error('API rate limit exceeded');
    (rateLimitError as any).status = 403;
    (rateLimitError as any).message = 'API rate limit exceeded';
    getTree.mockRejectedValueOnce(rateLimitError);

    // Attempt to sync
    await env.performPull();

    // Should show rate limit notice
    expect(Notice).toHaveBeenCalledWith(expect.stringContaining('Failed to pull from GitHub Wiki'));
    expect(console.error).toHaveBeenCalled();
  });

  test('Handles file system errors', async () => {
    // Mock vault.adapter.write to throw error
    const writeFile = env.app.vault.adapter.write as jest.Mock;
    writeFile.mockRejectedValueOnce(new Error('File system error: permission denied'));

    // Add remote file to be pulled
    env.addRemoteFile('NewRemotePage.md', '# New Remote Page\nThis page should be pulled');

    // Attempt to pull from GitHub
    await env.performPull();

    // Should continue with other files
    expect(Notice).toHaveBeenCalledWith(
      expect.stringContaining('Pulled 0 updated pages from GitHub Wiki')
    );
  });
});
