/**
 * End-to-End testing setup for the GitHub Wiki Sync Plugin
 * This file provides a mock environment that simulates the full flow
 * between Obsidian and GitHub.
 */

import { Octokit } from '@octokit/rest';
import { App, TFile } from 'obsidian';

import GitHubWikiSyncPlugin from '../../main';

// Mock file system for E2E tests
interface MockFile {
  path: string;
  content: string;
  lastModified: number;
}

export class E2ETestEnvironment {
  // Local "file system" for Obsidian
  localFiles: Map<string, MockFile> = new Map();

  // Remote "file system" for GitHub Wiki
  remoteFiles: Map<string, MockFile> = new Map();

  // Mock app and plugin instances
  app: App;
  plugin: GitHubWikiSyncPlugin;

  // Track sync events
  syncEvents: { type: string; timestamp: number; files: string[] }[] = [];

  constructor() {
    // Create mock app
    this.app = this.createMockApp();

    // Create and initialize plugin
    this.plugin = new GitHubWikiSyncPlugin(this.app, '');

    // Initialize default plugin settings
    this.plugin.settings = {
      githubToken: 'mock-token-for-e2e-tests',
      githubUsername: 'test-user',
      repositoryName: 'test-repo',
      wikiPath: 'wiki',
      syncOnSave: false,
      syncInterval: 0,
      lastSyncTimestamp: 0,
    };

    // Initialize statusBarItem
    this.plugin.statusBarItem = {
      setText: jest.fn(),
    } as any;

    // Mock the updateStatusBarItem method
    this.plugin.updateStatusBarItem = jest.fn();

    // Set up mock Octokit instance
    this.setupMockOctokit();
  }

  // Create mock app with vault functionality
  private createMockApp(): App {
    const self = this;

    const mockVault = {
      adapter: {
        exists: jest.fn().mockImplementation(async (path: string) => {
          return self.localFiles.has(path);
        }),
        read: jest.fn().mockImplementation(async (path: string) => {
          const file = self.localFiles.get(path);
          if (!file) throw new Error(`File not found: ${path}`);
          return file.content;
        }),
        write: jest.fn().mockImplementation(async (path: string, content: string) => {
          self.localFiles.set(path, {
            path,
            content,
            lastModified: Date.now(),
          });
          return undefined;
        }),
      },
      createFolder: jest.fn().mockResolvedValue(undefined),
      getMarkdownFiles: jest.fn().mockImplementation(() => {
        return Array.from(self.localFiles.values())
          .filter(file => file.path.endsWith('.md'))
          .map(file => new TFile(file.path, file.path));
      }),
      read: jest.fn().mockImplementation(async (file: TFile) => {
        const mockFile = self.localFiles.get(file.path);
        if (!mockFile) throw new Error(`File not found: ${file.path}`);
        return mockFile.content;
      }),
      on: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    };

    const mockApp = {
      vault: mockVault,
      workspace: {
        getActiveViewOfType: jest.fn(),
      },
    };

    return mockApp as unknown as App;
  }

  // Set up mock Octokit with GitHub API functionality
  private setupMockOctokit() {
    const self = this;

    const mockOctokit = {
      rest: {
        git: {
          getTree: jest.fn().mockImplementation(async () => {
            const files = Array.from(self.remoteFiles.values()).filter(file =>
              file.path.endsWith('.md')
            );

            return {
              data: {
                tree: files.map(file => ({
                  path: file.path,
                  sha: `sha-${file.path}-${file.lastModified}`,
                })),
              },
            };
          }),
        },
        repos: {
          getContent: jest.fn().mockImplementation(async ({ path }) => {
            // GitHub API paths don't include the wiki path
            const filePath = path;
            const file = Array.from(self.remoteFiles.values()).find(f => f.path === filePath);

            if (!file) {
              const error: any = new Error(`File not found: ${path}`);
              error.status = 404;
              throw error;
            }

            return {
              data: {
                content: Buffer.from(file.content).toString('base64'),
                sha: `sha-${file.path}-${file.lastModified}`,
              },
            };
          }),
          createOrUpdateFileContents: jest.fn().mockImplementation(async ({ path, content }) => {
            // Create or update file in remote storage
            self.remoteFiles.set(path, {
              path,
              content: Buffer.from(content, 'base64').toString('utf-8'),
              lastModified: Date.now(),
            });

            return {
              data: {
                content: {
                  sha: `sha-${path}-${Date.now()}`,
                },
              },
            };
          }),
        },
      },
    };

    // Mock Octokit constructor
    jest.spyOn(Octokit.prototype, 'constructor').mockImplementation(() => mockOctokit as any);

    // Replace plugin's octokit with our mock
    this.plugin.octokit = mockOctokit as unknown as Octokit;
  }

  // Add a file to local storage
  addLocalFile(path: string, content: string) {
    this.localFiles.set(path, {
      path,
      content,
      lastModified: Date.now(),
    });
  }

  // Add a file to remote storage
  addRemoteFile(path: string, content: string) {
    this.remoteFiles.set(path, {
      path,
      content,
      lastModified: Date.now(),
    });
  }

  // Get local file content
  getLocalFile(path: string): string | null {
    return this.localFiles.get(path)?.content || null;
  }

  // Get remote file content
  getRemoteFile(path: string): string | null {
    return this.remoteFiles.get(path)?.content || null;
  }

  // Reset the environment
  reset() {
    this.localFiles = new Map();
    this.remoteFiles = new Map();
    this.syncEvents = [];

    // Clean up mocks
    jest.resetAllMocks();
  }

  // Execute a full sync
  async performFullSync() {
    const syncStart = Date.now();

    // Mock updateStatusBarItem to prevent plugin trying to access real DOM
    const originalUpdateStatusBar = this.plugin.updateStatusBarItem;
    this.plugin.updateStatusBarItem = jest.fn();

    // Make sure statusBarItem.setText is properly mocked
    if (!this.plugin.statusBarItem) {
      this.plugin.statusBarItem = { setText: jest.fn() } as any;
    } else if (!this.plugin.statusBarItem.setText) {
      this.plugin.statusBarItem.setText = jest.fn();
    }

    try {
      await this.plugin.syncWithGitHub();

      // Record sync event
      this.syncEvents.push({
        type: 'full',
        timestamp: Date.now(),
        files: Array.from(this.localFiles.keys()),
      });

      return Date.now() - syncStart; // Return sync duration in ms
    } catch (error) {
      console.error('E2E test full sync error:', error);
      // Don't throw the error, just log it for test to handle
      return Date.now() - syncStart;
    } finally {
      // Restore original method
      this.plugin.updateStatusBarItem = originalUpdateStatusBar;
    }
  }

  // Execute pull only
  async performPull() {
    const pullStart = Date.now();

    // Mock updateStatusBarItem to prevent plugin trying to access real DOM
    const originalUpdateStatusBar = this.plugin.updateStatusBarItem;
    this.plugin.updateStatusBarItem = jest.fn();

    // Make sure statusBarItem.setText is properly mocked
    if (!this.plugin.statusBarItem) {
      this.plugin.statusBarItem = { setText: jest.fn() } as any;
    } else if (!this.plugin.statusBarItem.setText) {
      this.plugin.statusBarItem.setText = jest.fn();
    }

    try {
      await this.plugin.pullFromGitHub();

      // Record sync event
      this.syncEvents.push({
        type: 'pull',
        timestamp: Date.now(),
        files: Array.from(this.localFiles.keys()),
      });

      return Date.now() - pullStart; // Return pull duration in ms
    } catch (error) {
      console.error('E2E test pull error:', error);
      // Don't throw the error, just log it for test to handle
      return Date.now() - pullStart;
    } finally {
      // Restore original method
      this.plugin.updateStatusBarItem = originalUpdateStatusBar;
    }
  }

  // Execute push only
  async performPush() {
    const pushStart = Date.now();

    // Mock updateStatusBarItem to prevent plugin trying to access real DOM
    const originalUpdateStatusBar = this.plugin.updateStatusBarItem;
    this.plugin.updateStatusBarItem = jest.fn();

    // Make sure statusBarItem.setText is properly mocked
    if (!this.plugin.statusBarItem) {
      this.plugin.statusBarItem = { setText: jest.fn() } as any;
    } else if (!this.plugin.statusBarItem.setText) {
      this.plugin.statusBarItem.setText = jest.fn();
    }

    try {
      await this.plugin.pushToGitHub();

      // Record sync event
      this.syncEvents.push({
        type: 'push',
        timestamp: Date.now(),
        files: Array.from(this.localFiles.keys()),
      });

      return Date.now() - pushStart; // Return push duration in ms
    } catch (error) {
      console.error('E2E test push error:', error);
      // Don't throw the error, just log it for test to handle
      return Date.now() - pushStart;
    } finally {
      // Restore original method
      this.plugin.updateStatusBarItem = originalUpdateStatusBar;
    }
  }
}

// Helper to set up a standard environment with some test data
export function createStandardE2EEnvironment(): E2ETestEnvironment {
  const env = new E2ETestEnvironment();

  // Add some local files
  env.addLocalFile('wiki/Home.md', '# Wiki Home\nWelcome to the test wiki!');
  env.addLocalFile('wiki/Features.md', '# Features\n- Feature 1\n- Feature 2');

  // Add some remote files
  env.addRemoteFile('Home.md', '# Wiki Home\nWelcome to the test wiki!');
  env.addRemoteFile('Features.md', '# Features\n- Feature 1\n- Feature 2');
  env.addRemoteFile('Setup.md', '# Setup\nInstructions for setting up the project');

  return env;
}
