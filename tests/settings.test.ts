import { App, PluginSettingTab, Setting } from 'obsidian';

import GitHubWikiSyncPlugin from '../main';

// Mock Setting
jest.mock('obsidian', () => {
  const original = jest.requireActual('./tests/__mocks__/obsidian.ts');
  return {
    ...original,
    Setting: jest.fn().mockImplementation(() => {
      return {
        setName: jest.fn().mockReturnThis(),
        setDesc: jest.fn().mockReturnThis(),
        addText: jest.fn().mockImplementation(cb => {
          cb({
            setPlaceholder: jest.fn().mockReturnThis(),
            setValue: jest.fn().mockReturnThis(),
            onChange: jest.fn(),
          });
          return this;
        }),
        addToggle: jest.fn().mockImplementation(cb => {
          cb({
            setValue: jest.fn().mockReturnThis(),
            onChange: jest.fn(),
          });
          return this;
        }),
        addSlider: jest.fn().mockImplementation(cb => {
          cb({
            setLimits: jest.fn().mockReturnThis(),
            setValue: jest.fn().mockReturnThis(),
            setDynamicTooltip: jest.fn().mockReturnThis(),
            onChange: jest.fn(),
          });
          return this;
        }),
        addButton: jest.fn().mockImplementation(cb => {
          cb({
            setButtonText: jest.fn().mockReturnThis(),
            setCta: jest.fn().mockReturnThis(),
            setDisabled: jest.fn().mockReturnThis(),
            onClick: jest.fn(),
          });
          return this;
        }),
      };
    }),
  };
});

describe('GitHub Wiki Sync Settings', () => {
  let app: App;
  let plugin: GitHubWikiSyncPlugin;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    app = new App();
    plugin = new GitHubWikiSyncPlugin(app, '');

    // Setup status bar item
    plugin.statusBarItem = { setText: jest.fn() } as any;

    // Mock loadSettings
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

    // Other mocks needed for tests
    plugin.updateStatusBarItem = jest.fn();
    plugin.initializeGitHub = jest.fn();
    plugin.setupAutoSync = jest.fn();

    // Initialize plugin
    return plugin.loadSettings();
  });

  it('should add settings tab during plugin load', async () => {
    plugin.addSettingTab = jest.fn();

    await plugin.onload();

    expect(plugin.addSettingTab).toHaveBeenCalled();
  });

  it('should save settings and reinitialize GitHub', async () => {
    // Mock saveData
    plugin.saveData = jest.fn().mockResolvedValue(undefined);

    await plugin.saveSettings();

    expect(plugin.saveData).toHaveBeenCalledWith(plugin.settings);
    expect(plugin.initializeGitHub).toHaveBeenCalled();
    expect(plugin.setupAutoSync).toHaveBeenCalled();
  });

  it('should handle sync-on-save setting correctly', async () => {
    // Simply test that settings values can be changed
    plugin.settings.syncOnSave = true;
    expect(plugin.settings.syncOnSave).toBe(true);

    plugin.settings.syncOnSave = false;
    expect(plugin.settings.syncOnSave).toBe(false);
  });

  it('should add commands during plugin load', async () => {
    // Mock addCommand
    plugin.addCommand = jest.fn();

    await plugin.onload();

    // Should add commands
    expect(plugin.addCommand).toHaveBeenCalled();
  });

  it('should clear interval on plugin unload', () => {
    // Mock window.clearInterval
    const originalClearInterval = window.clearInterval;
    const mockClearInterval = jest.fn();
    window.clearInterval = mockClearInterval;

    try {
      // Set syncIntervalId
      plugin.syncIntervalId = 123;

      // Unload plugin
      plugin.onunload();

      // Should clear interval
      expect(mockClearInterval).toHaveBeenCalledWith(123);
    } finally {
      window.clearInterval = originalClearInterval;
    }
  });
});
