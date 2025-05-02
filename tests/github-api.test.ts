/**
 * Tests for GitHub API interactions
 */

import { Octokit } from '@octokit/rest';
import { App } from 'obsidian';

import GitHubWikiSyncPlugin from '../main';

// Mock Octokit
jest.mock('@octokit/rest');

describe('GitHub API Interactions', () => {
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

    // Set up mock Octokit instance with more detailed API responses
    mockOctokit = {
      rest: {
        git: {
          getTree: jest.fn().mockResolvedValue({
            data: {
              tree: [
                { path: 'Home.md', sha: 'sha1' },
                { path: 'Features.md', sha: 'sha2' },
                { path: 'Subfolder/Setup.md', sha: 'sha3' },
                { path: 'non-markdown-file.txt', sha: 'sha4' }, // Should be filtered out
                { path: 'README.md', sha: 'sha5' },
              ],
            },
          }),
        },
        repos: {
          getContent: jest.fn().mockImplementation(async ({ path }) => {
            // Simulate different responses based on the file path
            if (path === 'Home.md') {
              return {
                data: {
                  content: Buffer.from('# Home\nWelcome to the wiki!').toString('base64'),
                  sha: 'sha1',
                },
              };
            } else if (path === 'Features.md') {
              return {
                data: {
                  content: Buffer.from('# Features\n- Feature 1\n- Feature 2').toString('base64'),
                  sha: 'sha2',
                },
              };
            } else if (path === 'Subfolder/Setup.md') {
              return {
                data: {
                  content: Buffer.from('# Setup\nSetup instructions').toString('base64'),
                  sha: 'sha3',
                },
              };
            } else if (path === 'README.md') {
              return {
                data: {
                  content: Buffer.from('# README\nReadme content').toString('base64'),
                  sha: 'sha5',
                },
              };
            } else if (path === 'NewPage.md') {
              // Simulate 404 for new pages
              const error: any = new Error('Not found');
              error.status = 404;
              throw error;
            } else {
              // Default response for other files
              return {
                data: {
                  content: Buffer.from('# Default Content').toString('base64'),
                  sha: 'default-sha',
                },
              };
            }
          }),
          createOrUpdateFileContents: jest.fn().mockImplementation(async ({ path, sha }) => {
            if (path === 'ErrorFile.md') {
              throw new Error('Failed to create/update file');
            }

            // Return successful response with generated SHA
            return {
              data: {
                content: {
                  sha: sha ? `updated-${sha}` : `new-sha-${Date.now()}`,
                },
              },
            };
          }),
        },
      },
    } as unknown as jest.Mocked<Octokit>;

    // Set the mocked Octokit
    (Octokit as unknown as jest.Mock).mockReturnValue(mockOctokit);

    // Initialize plugin with mocked Octokit
    plugin.initializeGitHub();
  });

  describe('getWikiPages', () => {
    it('should retrieve and filter wiki pages correctly', async () => {
      const pages = await plugin.getWikiPages();

      // Check API call
      expect(mockOctokit.rest.git.getTree).toHaveBeenCalledWith({
        owner: 'testuser',
        repo: 'testrepo.wiki',
        tree_sha: 'master',
        recursive: '1',
      });

      // Should only include markdown files
      expect(pages).toHaveLength(4);

      // Check structure
      expect(pages[0]).toMatchObject({
        name: 'Home',
        path: 'Home.md',
        sha: 'sha1',
      });

      // Check that subfolder paths are handled correctly
      expect(pages[2]).toMatchObject({
        name: 'Subfolder/Setup',
        path: 'Subfolder/Setup.md',
        sha: 'sha3',
      });
    });

    it('should handle empty repository', async () => {
      // Mock empty tree response
      mockOctokit.rest.git.getTree.mockResolvedValueOnce({
        data: {
          tree: [],
        },
      });

      const pages = await plugin.getWikiPages();

      // Should return empty array
      expect(pages).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      // Mock API error
      mockOctokit.rest.git.getTree.mockRejectedValueOnce(new Error('API Error'));

      // Should throw the error
      await expect(plugin.getWikiPages()).rejects.toThrow('API Error');
    });

    it('should handle undefined octokit', async () => {
      // Set octokit to null
      plugin.octokit = null;

      // Should return empty array
      const pages = await plugin.getWikiPages();
      expect(pages).toHaveLength(0);
    });
  });

  describe('getWikiPageContent', () => {
    it('should retrieve and decode page content', async () => {
      const content = await plugin.getWikiPageContent('Home');

      // Check API call
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
        owner: 'testuser',
        repo: 'testrepo.wiki',
        path: 'Home.md',
      });

      // Check content
      expect(content).toBe('# Home\nWelcome to the wiki!');
    });

    it('should retrieve content for pages in subfolders', async () => {
      const content = await plugin.getWikiPageContent('Subfolder/Setup');

      // Check API call
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
        owner: 'testuser',
        repo: 'testrepo.wiki',
        path: 'Subfolder/Setup.md',
      });

      // Check content
      expect(content).toBe('# Setup\nSetup instructions');
    });

    it('should handle API errors', async () => {
      // Mock API error
      mockOctokit.rest.repos.getContent.mockRejectedValueOnce(new Error('API Error'));

      // Should throw the error
      await expect(plugin.getWikiPageContent('ErrorPage')).rejects.toThrow('API Error');
    });

    it('should handle directory response instead of file', async () => {
      // Mock directory response
      mockOctokit.rest.repos.getContent.mockResolvedValueOnce({
        data: [
          { name: 'file1.md', type: 'file' },
          { name: 'file2.md', type: 'file' },
        ],
      });

      // Should throw error
      await expect(plugin.getWikiPageContent('Directory')).rejects.toThrow(
        'Expected a file but got a directory'
      );
    });

    it('should handle empty content', async () => {
      // Mock empty content response
      mockOctokit.rest.repos.getContent.mockResolvedValueOnce({
        data: {},
      });

      // Should throw error
      await expect(plugin.getWikiPageContent('EmptyFile')).rejects.toThrow(
        'Response does not contain content'
      );
    });

    it('should handle undefined octokit', async () => {
      // Set octokit to null
      plugin.octokit = null;

      // Should return empty string
      const content = await plugin.getWikiPageContent('Home');
      expect(content).toBe('');
    });
  });

  describe('updateWikiPage', () => {
    it('should update existing wiki page', async () => {
      await plugin.updateWikiPage('Home', 'Updated content');

      // Should first get existing content to get SHA
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
        owner: 'testuser',
        repo: 'testrepo.wiki',
        path: 'Home.md',
      });

      // Should update with SHA
      expect(mockOctokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: 'testuser',
          repo: 'testrepo.wiki',
          path: 'Home.md',
          message: expect.stringContaining('Update Home'),
          content: Buffer.from('Updated content').toString('base64'),
          sha: 'sha1',
        })
      );
    });

    it('should create new wiki page when it does not exist', async () => {
      // This will trigger a 404 in our mock
      await plugin.updateWikiPage('NewPage', 'New page content');

      // Should try to get existing content first (will 404)
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
        owner: 'testuser',
        repo: 'testrepo.wiki',
        path: 'NewPage.md',
      });

      // Should create without SHA
      expect(mockOctokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: 'testuser',
          repo: 'testrepo.wiki',
          path: 'NewPage.md',
          message: expect.stringContaining('Create NewPage'),
          content: Buffer.from('New page content').toString('base64'),
        })
      );

      // Should not include SHA
      const callArgs = mockOctokit.rest.repos.createOrUpdateFileContents.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('sha');
    });

    it('should handle directory response instead of file', async () => {
      // Mock directory response
      mockOctokit.rest.repos.getContent.mockResolvedValueOnce({
        data: [
          { name: 'file1.md', type: 'file' },
          { name: 'file2.md', type: 'file' },
        ],
      });

      // Should throw error
      await expect(plugin.updateWikiPage('Directory', 'New content')).rejects.toThrow(
        'Expected a file but got a directory'
      );
    });

    it('should handle response without SHA', async () => {
      // Mock response without SHA
      mockOctokit.rest.repos.getContent.mockResolvedValueOnce({
        data: {
          content: Buffer.from('Content').toString('base64'),
          // No SHA
        },
      });

      // Should throw error
      await expect(plugin.updateWikiPage('NoSha', 'New content')).rejects.toThrow(
        'Response does not contain sha'
      );
    });

    it('should handle API errors during update', async () => {
      // This will trigger an error in our mock
      await expect(plugin.updateWikiPage('ErrorFile', 'Error content')).rejects.toThrow(
        'Failed to create/update file'
      );
    });

    it('should handle undefined octokit', async () => {
      // Set octokit to null
      plugin.octokit = null;

      // Should return undefined without error
      await plugin.updateWikiPage('Home', 'Updated content');
      expect(mockOctokit.rest.repos.createOrUpdateFileContents).not.toHaveBeenCalled();
    });
  });
});
