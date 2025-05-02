import { Octokit } from '@octokit/rest';
import { App, TFile, Vault } from 'obsidian';

import GitHubWikiSyncPlugin from '../../main';

// Mock complete scenarios for GitHub API
jest.mock('@octokit/rest', () => {
  // Mock file data for GitHub Wiki
  const wikiFiles = {
    'Home.md': {
      content: Buffer.from('# Wiki Home\nThis is the home page.').toString('base64'),
      sha: 'abc123',
    },
    'Setup.md': {
      content: Buffer.from('# Setup Guide\nFollow these steps to set up.').toString('base64'),
      sha: 'def456',
    },
    'API.md': {
      content: Buffer.from('# API Documentation\nThis documents the API.').toString('base64'),
      sha: 'ghi789',
    },
  };

  // Track operations for verification
  const mockOperations = {
    pulls: [] as any[],
    pushes: [] as any[],
    creations: [] as any[],
    updates: [] as any[],
  };

  return {
    mockOperations,
    Octokit: jest.fn().mockImplementation(() => {
      return {
        rest: {
          git: {
            getTree: jest.fn().mockResolvedValue({
              data: {
                tree: [
                  { path: 'Home.md', sha: 'abc123' },
                  { path: 'Setup.md', sha: 'def456' },
                  { path: 'API.md', sha: 'ghi789' },
                ],
              },
            }),
          },
          repos: {
            getContent: jest.fn().mockImplementation(({ path }) => {
              const fileName = path.replace(/^\/+|\/+$/g, '');
              if (wikiFiles[fileName]) {
                return Promise.resolve({
                  data: {
                    content: wikiFiles[fileName].content,
                    sha: wikiFiles[fileName].sha,
                  },
                });
              }
              return Promise.reject(new Error(`File ${fileName} not found`));
            }),
            createOrUpdateFileContents: jest
              .fn()
              .mockImplementation(({ path, content, message, sha }) => {
                const fileName = path.replace(/^\/+|\/+$/g, '');

                // Track operation type
                if (!wikiFiles[fileName]) {
                  mockOperations.creations.push({ fileName, content });
                  wikiFiles[fileName] = {
                    content,
                    sha: `new-${Date.now()}`,
                  };
                } else {
                  mockOperations.updates.push({ fileName, content });
                  wikiFiles[fileName].content = content;
                  wikiFiles[fileName].sha = `update-${Date.now()}`;
                }

                return Promise.resolve({
                  data: {
                    content: {
                      sha: wikiFiles[fileName].sha,
                    },
                  },
                });
              }),
          },
        },
      };
    }),
  };
});

// Import the mock operations tracker
const { mockOperations } = jest.requireMock('@octokit/rest');

// Create a complete mock for Obsidian Vault
class MockVault implements Partial<Vault> {
  private files: Map<string, string> = new Map();

  constructor() {
    // Initialize with some files
    this.files.set('wiki/Home.md', '# Wiki Home\nThis is the home page.');
    this.files.set('wiki/Guide.md', '# User Guide\nThis is a guide for users.');
    this.files.set('notes/personal.md', '# Personal Notes\nThese are personal notes.');
  }

  adapter = {
    exists: async (path: string) => this.files.has(path),
    read: async (path: string) => {
      const content = this.files.get(path);
      if (!content) throw new Error(`File ${path} not found`);
      return content;
    },
    write: async (path: string, content: string) => {
      this.files.set(path, content);
    },
  };

  createFolder = async (path: string) => {
    // Just pretend we created the folder
    return;
  };

  getMarkdownFiles = () => {
    // Convert to TFile objects
    return Array.from(this.files.entries()).map(([path, _]) => {
      return {
        path,
        name: path.split('/').pop() || '',
        extension: 'md',
      } as TFile;
    });
  };

  read = async (file: TFile) => {
    return this.adapter.read(file.path);
  };

  // Event handling
  on = jest.fn().mockReturnValue({ unsubscribe: jest.fn() });

  // For debugging
  getAllFiles() {
    return this.files;
  }
}

describe('GitHub Wiki Sync Integration Tests', () => {
  let app: App;
  let plugin: GitHubWikiSyncPlugin;
  let mockVault: MockVault;

  beforeEach(() => {
    // Reset operations tracking
    mockOperations.pulls = [];
    mockOperations.pushes = [];
    mockOperations.creations = [];
    mockOperations.updates = [];

    // Create mock app with our vault
    mockVault = new MockVault();
    app = {
      vault: mockVault,
    } as any;

    // Create plugin with mocked components
    plugin = new GitHubWikiSyncPlugin(app, '');

    // Mock DOM-related methods
    plugin.statusBarItem = { setText: jest.fn() } as any;
    plugin.addStatusBarItem = jest.fn().mockReturnValue({ setText: jest.fn() });
    plugin.addRibbonIcon = jest.fn().mockReturnValue({ addClass: jest.fn() });
    plugin.addCommand = jest.fn();
    plugin.addSettingTab = jest.fn();
    plugin.registerEvent = jest.fn();

    // Configure plugin settings
    plugin.settings = {
      githubToken: 'mock-token',
      githubUsername: 'user',
      repositoryName: 'repo',
      wikiPath: 'wiki',
      syncOnSave: false,
      syncInterval: 0,
      lastSyncTimestamp: 0,
    };

    // Initialize GitHub client
    plugin.initializeGitHub();
  });

  test('Full sync process pulls and pushes files correctly', async () => {
    // Spy on internal methods
    const pullSpy = jest.spyOn(plugin, 'pullFromGitHub');
    const pushSpy = jest.spyOn(plugin, 'pushToGitHub');

    // Perform full sync
    await plugin.syncWithGitHub();

    // Check that both pull and push were called
    expect(pullSpy).toHaveBeenCalled();
    expect(pushSpy).toHaveBeenCalled();

    // Verify files were pulled from GitHub
    const allFiles = mockVault.getAllFiles();
    expect(allFiles.get('wiki/Home.md')).toBe('# Wiki Home\nThis is the home page.');
    expect(allFiles.get('wiki/Setup.md')).toBe('# Setup Guide\nFollow these steps to set up.');
    expect(allFiles.get('wiki/API.md')).toBe('# API Documentation\nThis documents the API.');

    // Verify new files were pushed to GitHub
    const pushedGuide = mockOperations.creations.find(op => op.fileName === 'Guide.md');
    expect(pushedGuide).toBeDefined();

    // Original local files should remain
    expect(allFiles.get('wiki/Guide.md')).toBe('# User Guide\nThis is a guide for users.');
    expect(allFiles.get('notes/personal.md')).toBe('# Personal Notes\nThese are personal notes.');
  });

  test('Pull from GitHub only downloads missing or changed files', async () => {
    // First modify a local file to differ from the GitHub version
    await mockVault.adapter.write('wiki/Home.md', '# Modified Home\nThis is modified locally.');

    // Track files written
    const writeFileSpy = jest.spyOn(mockVault.adapter, 'write');

    // Pull from GitHub
    await plugin.pullFromGitHub();

    // Verify that we didn't overwrite the modified file
    const allFiles = mockVault.getAllFiles();
    expect(allFiles.get('wiki/Home.md')).toBe('# Modified Home\nThis is modified locally.');

    // Verify that new files were added from GitHub
    expect(allFiles.get('wiki/Setup.md')).toBe('# Setup Guide\nFollow these steps to set up.');
    expect(allFiles.get('wiki/API.md')).toBe('# API Documentation\nThis documents the API.');

    // Verify we only wrote 2 files (Setup and API, not Home)
    expect(writeFileSpy).toHaveBeenCalledTimes(2);
  });

  test('Push to GitHub only uploads new or changed files', async () => {
    // Setup scenario
    await mockVault.adapter.write('wiki/Home.md', '# Modified Home\nThis is modified locally.');
    await mockVault.adapter.write('wiki/NewFile.md', '# New File\nThis is a new file.');

    // Push to GitHub
    await plugin.pushToGitHub();

    // Check that we updated one file and created one new file
    expect(mockOperations.updates.length).toBe(1);
    expect(mockOperations.creations.length).toBe(2); // NewFile + Guide

    // Verify specific update
    const homeUpdate = mockOperations.updates.find(op => op.fileName === 'Home.md');
    expect(homeUpdate).toBeDefined();

    // Verify specific creation
    const newFileCreation = mockOperations.creations.find(op => op.fileName === 'NewFile.md');
    expect(newFileCreation).toBeDefined();
  });

  test('Single file push works correctly', async () => {
    // Create a test file
    const testFile = {
      path: 'wiki/SingleFile.md',
      name: 'SingleFile.md',
      extension: 'md',
    } as TFile;

    // Add content to the file
    await mockVault.adapter.write(
      'wiki/SingleFile.md',
      '# Single File\nThis is a single file to push.'
    );

    // Push the single file
    await plugin.pushFileToGitHub(testFile);

    // Verify the file was created in GitHub
    const singleFileCreation = mockOperations.creations.find(op => op.fileName === 'SingleFile.md');
    expect(singleFileCreation).toBeDefined();

    // Verify timestamp was updated
    expect(plugin.settings.lastSyncTimestamp).not.toBe(0);
  });

  test('Path conversion works correctly', () => {
    // Test wikiPath with folder
    plugin.settings.wikiPath = 'wiki';

    // Test getLocalPath
    expect(plugin.getLocalPath('test')).toBe('wiki/test.md');
    expect(plugin.getLocalPath('nested/page')).toBe('wiki/nested/page.md');

    // Test getWikiName
    expect(plugin.getWikiName('wiki/test.md')).toBe('test');
    expect(plugin.getWikiName('wiki/nested/page.md')).toBe('nested/page');

    // Test with root path
    plugin.settings.wikiPath = '';
    expect(plugin.getLocalPath('test')).toBe('test.md');
    expect(plugin.getWikiName('test.md')).toBe('test');
  });
});
