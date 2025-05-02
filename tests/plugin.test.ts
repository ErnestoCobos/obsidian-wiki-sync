import { App, MarkdownView, Plugin, TFile } from 'obsidian';
import GitHubWikiSyncPlugin from '../main';
import { Octokit } from '@octokit/rest';

// Mock Octokit
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        rest: {
          git: {
            getTree: jest.fn().mockResolvedValue({
              data: {
                tree: [
                  {
                    path: 'test.md',
                    sha: '123456',
                  },
                ],
              },
            }),
          },
          repos: {
            getContent: jest.fn().mockResolvedValue({
              data: {
                content: Buffer.from('# Test Content').toString('base64'),
                sha: '123456',
              },
            }),
            createOrUpdateFileContents: jest.fn().mockResolvedValue({}),
          },
        },
      };
    }),
  };
});

describe('GitHub Wiki Sync Plugin', () => {
  let app: App;
  let plugin: GitHubWikiSyncPlugin;

  beforeEach(() => {
    app = new App();
    plugin = new GitHubWikiSyncPlugin(app, '');
    
    // Setup status bar item
    plugin.statusBarItem = { setText: jest.fn() } as any;
    
    // Mock implementation of loadSettings
    plugin.loadSettings = jest.fn().mockImplementation(async () => {
      plugin.settings = {
        githubToken: 'test-token',
        githubUsername: 'test-user',
        repositoryName: 'test-repo',
        wikiPath: 'wiki',
        syncOnSave: false,
        syncInterval: 0,
        lastSyncTimestamp: 0,
      };
    });
    
    // Make sure to complete loadSettings before each test
    return plugin.loadSettings();
  });

  it('should initialize plugin', async () => {
    // Mock the methods that would be called during onload
    plugin.initializeGitHub = jest.fn();
    plugin.updateStatusBarItem = jest.fn();
    plugin.setupAutoSync = jest.fn();
    
    await plugin.onload();
    expect(plugin.addRibbonIcon).toHaveBeenCalled();
    expect(plugin.addStatusBarItem).toHaveBeenCalled();
    expect(plugin.addCommand).toHaveBeenCalledTimes(3);
    expect(plugin.addSettingTab).toHaveBeenCalled();
    expect(plugin.initializeGitHub).toHaveBeenCalled();
  });

  it('should initialize GitHub client when token is present', async () => {
    // Ensure statusBarItem is set up
    plugin.statusBarItem = { setText: jest.fn() } as any;
    plugin.updateStatusBarItem = jest.fn();
    
    plugin.initializeGitHub();
    expect(Octokit).toHaveBeenCalledWith({ auth: 'test-token' });
    expect(plugin.octokit).not.toBeNull();
    expect(plugin.updateStatusBarItem).toHaveBeenCalled();
  });

  it('should not initialize GitHub client when token is not present', async () => {
    // Ensure statusBarItem is set up
    plugin.statusBarItem = { setText: jest.fn() } as any;
    plugin.updateStatusBarItem = jest.fn();
    
    plugin.settings.githubToken = '';
    plugin.initializeGitHub();
    expect(plugin.octokit).toBeNull();
    expect(plugin.updateStatusBarItem).toHaveBeenCalledWith('Not configured');
  });

  it('should setup auto sync when interval is set', async () => {
    plugin.settings.syncInterval = 10;
    
    // Mock window.setInterval
    const originalSetInterval = window.setInterval;
    const mockSetInterval = jest.fn().mockReturnValue(123);
    window.setInterval = mockSetInterval;
    
    try {
      plugin.setupAutoSync();
      expect(mockSetInterval).toHaveBeenCalled();
      expect(plugin.syncIntervalId).toBe(123);
    } finally {
      window.setInterval = originalSetInterval;
    }
  });

  it('should not setup auto sync when interval is 0', async () => {
    plugin.settings.syncInterval = 0;
    
    // Mock window.setInterval
    const mockSetInterval = jest.fn();
    const originalSetInterval = window.setInterval;
    window.setInterval = mockSetInterval;
    
    try {
      plugin.setupAutoSync();
      expect(mockSetInterval).not.toHaveBeenCalled();
      expect(plugin.syncIntervalId).toBeNull();
    } finally {
      window.setInterval = originalSetInterval;
    }
  });

  it('should update status bar item', async () => {
    const mockSetText = jest.fn();
    plugin.statusBarItem = { setText: mockSetText } as any;
    
    // Test not configured state
    plugin.octokit = null;
    plugin.updateStatusBarItem();
    expect(mockSetText).toHaveBeenCalledWith('GitHub Wiki: Not configured');
    
    // Test with octokit but no sync timestamp
    plugin.octokit = new Octokit({ auth: 'test-token' });
    plugin.settings.lastSyncTimestamp = 0;
    plugin.updateStatusBarItem();
    expect(mockSetText).toHaveBeenCalledWith('GitHub Wiki: Never synced');
    
    // Test with custom text
    plugin.updateStatusBarItem('Testing');
    expect(mockSetText).toHaveBeenCalledWith('GitHub Wiki: Testing');
  });

  it('should correctly convert between wiki names and local paths', async () => {
    // Test getLocalPath
    expect(plugin.getLocalPath('test')).toBe('wiki/test.md');
    
    // Test getWikiName
    expect(plugin.getWikiName('wiki/test.md')).toBe('test');
    expect(plugin.getWikiName('test.md')).toBe('test');
  });
});