/**
 * Test file for the GitHubWikiSyncSettingTab class
 */

import { App, PluginSettingTab, Setting } from 'obsidian';

import GitHubWikiSyncPlugin from '../main';

// Mock Setting methods
jest.mock('obsidian', () => {
  const original = jest.requireActual('./__mocks__/obsidian.ts');
  return {
    ...original,
  };
});

describe('GitHub Wiki Sync Settings Tab', () => {
  let app: App;
  let plugin: GitHubWikiSyncPlugin;
  let settingTab: any; // Using any because we need to access private properties

  beforeEach(() => {
    // Set up app and plugin
    app = new App();
    plugin = new GitHubWikiSyncPlugin(app, '');

    // Mock plugin methods
    plugin.loadSettings = jest.fn().mockImplementation(async () => {
      plugin.settings = {
        githubToken: 'mock-token',
        githubUsername: 'test-user',
        repositoryName: 'test-repo',
        wikiPath: 'wiki',
        syncOnSave: false,
        syncInterval: 0,
        lastSyncTimestamp: Date.now(),
      };
    });
    plugin.saveSettings = jest.fn().mockResolvedValue(undefined);
    plugin.syncWithGitHub = jest.fn().mockResolvedValue(undefined);

    // Load settings before each test
    return plugin.loadSettings();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create settings tab with correct sections', () => {
    // Create settings tab instance
    settingTab = plugin.settingTab;

    // Mock containerEl
    const containerEl = {
      empty: jest.fn(),
      createEl: jest.fn().mockReturnValue({}),
    };
    settingTab.containerEl = containerEl;

    // Mock Setting constructor
    const mockAddText = jest.fn().mockReturnValue({ onChange: jest.fn() });
    const mockAddToggle = jest.fn().mockReturnValue({ onChange: jest.fn() });
    const mockAddSlider = jest.fn().mockReturnValue({
      setLimits: jest.fn().mockReturnThis(),
      setValue: jest.fn().mockReturnThis(),
      setDynamicTooltip: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockReturnThis(),
    });
    const mockAddButton = jest.fn().mockReturnValue({
      setButtonText: jest.fn().mockReturnThis(),
      setCta: jest.fn().mockReturnThis(),
      onClick: jest.fn().mockReturnThis(),
    });

    const mockSetting = jest.fn().mockImplementation(() => {
      return {
        setName: jest.fn().mockReturnThis(),
        setDesc: jest.fn().mockReturnThis(),
        addText: mockAddText,
        addToggle: mockAddToggle,
        addSlider: mockAddSlider,
        addButton: mockAddButton,
      };
    });

    // Replace Setting constructor
    const originalSetting = Setting;
    (Setting as any) = mockSetting;

    try {
      // Call display method
      settingTab.display();

      // Check expectations
      expect(containerEl.empty).toHaveBeenCalled();
      expect(containerEl.createEl).toHaveBeenCalledWith('h2', {
        text: 'GitHub Wiki Sync Settings',
      });

      // Should create 6 settings: token, username, repo, path, sync on save, interval, and sync button
      expect(mockSetting).toHaveBeenCalledTimes(7);

      // Check specific settings
      expect(mockAddText).toHaveBeenCalled();
      expect(mockAddToggle).toHaveBeenCalled();
      expect(mockAddSlider).toHaveBeenCalled();
      expect(mockAddButton).toHaveBeenCalled();

      // Last sync time should be displayed if available
      expect(containerEl.createEl).toHaveBeenCalledWith(
        'div',
        expect.objectContaining({
          cls: 'setting-item-description',
        })
      );
    } finally {
      // Restore original Setting constructor
      (Setting as any) = originalSetting;
    }
  });

  it('should handle sync button clicks', async () => {
    // Create settings tab instance
    settingTab = plugin.settingTab;

    // Mock containerEl
    const containerEl = {
      empty: jest.fn(),
      createEl: jest.fn().mockReturnValue({}),
    };
    settingTab.containerEl = containerEl;

    // Create a mock button that captures the onClick callback
    let onClickCallback: Function;
    const mockButton = {
      setButtonText: jest.fn().mockReturnThis(),
      setCta: jest.fn().mockReturnThis(),
      setDisabled: jest.fn().mockReturnThis(),
      onClick: jest.fn().mockImplementation(callback => {
        onClickCallback = callback;
        return mockButton;
      }),
    };

    // Mock Setting constructor to capture the addButton callback
    const mockSetting = jest.fn().mockImplementation(() => {
      return {
        setName: jest.fn().mockReturnThis(),
        setDesc: jest.fn().mockReturnThis(),
        addText: jest.fn().mockReturnValue({ onChange: jest.fn() }),
        addToggle: jest.fn().mockReturnValue({ onChange: jest.fn() }),
        addSlider: jest.fn().mockReturnValue({
          setLimits: jest.fn().mockReturnThis(),
          setValue: jest.fn().mockReturnThis(),
          setDynamicTooltip: jest.fn().mockReturnThis(),
          onChange: jest.fn().mockReturnThis(),
        }),
        addButton: jest.fn().mockImplementation(callback => {
          callback(mockButton);
          return mockSetting;
        }),
      };
    });

    // Replace Setting constructor
    const originalSetting = Setting;
    (Setting as any) = mockSetting;

    // Create a spy for display
    settingTab.display = jest.fn();

    try {
      // Show settings
      settingTab.display();

      // Execute the onClick callback
      await onClickCallback();

      // Button should be disabled during sync
      expect(mockButton.setDisabled).toHaveBeenCalledWith(true);
      expect(mockButton.setButtonText).toHaveBeenCalledWith('Syncing...');

      // Sync should be called
      expect(plugin.syncWithGitHub).toHaveBeenCalled();

      // Button should be enabled after sync
      expect(mockButton.setButtonText).toHaveBeenCalledWith('Done!');

      // Simulate setTimeout callback
      jest.runAllTimers();

      // Button should be reset
      expect(mockButton.setButtonText).toHaveBeenCalledWith('Sync');
      expect(mockButton.setDisabled).toHaveBeenCalledWith(false);

      // Display should be called again
      expect(settingTab.display).toHaveBeenCalled();
    } finally {
      // Restore original Setting constructor
      (Setting as any) = originalSetting;
    }
  });

  it('should handle settings changes', async () => {
    // Create settings tab instance
    settingTab = plugin.settingTab;

    // Mock containerEl
    const containerEl = {
      empty: jest.fn(),
      createEl: jest.fn().mockReturnValue({}),
    };
    settingTab.containerEl = containerEl;

    // Create a mock for text input
    let tokenChangeCallback: Function;
    const mockTextComponent = {
      setPlaceholder: jest.fn().mockReturnThis(),
      setValue: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockImplementation(callback => {
        tokenChangeCallback = callback;
        return mockTextComponent;
      }),
    };

    // Create a mock for toggle input
    let toggleChangeCallback: Function;
    const mockToggleComponent = {
      setValue: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockImplementation(callback => {
        toggleChangeCallback = callback;
        return mockToggleComponent;
      }),
    };

    // Create a mock for slider input
    let sliderChangeCallback: Function;
    const mockSliderComponent = {
      setLimits: jest.fn().mockReturnThis(),
      setValue: jest.fn().mockReturnThis(),
      setDynamicTooltip: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockImplementation(callback => {
        sliderChangeCallback = callback;
        return mockSliderComponent;
      }),
    };

    // Mock Setting constructor to capture callbacks
    const mockSetting = jest.fn().mockImplementation(() => {
      return {
        setName: jest.fn().mockReturnThis(),
        setDesc: jest.fn().mockReturnThis(),
        addText: jest.fn().mockImplementation(callback => {
          callback(mockTextComponent);
          return mockSetting;
        }),
        addToggle: jest.fn().mockImplementation(callback => {
          callback(mockToggleComponent);
          return mockSetting;
        }),
        addSlider: jest.fn().mockImplementation(callback => {
          callback(mockSliderComponent);
          return mockSetting;
        }),
        addButton: jest.fn().mockReturnThis(),
      };
    });

    // Replace Setting constructor
    const originalSetting = Setting;
    (Setting as any) = mockSetting;

    try {
      // Show settings
      settingTab.display();

      // Test token change
      await tokenChangeCallback('new-token');
      expect(plugin.settings.githubToken).toBe('new-token');
      expect(plugin.saveSettings).toHaveBeenCalled();

      // Reset call count
      plugin.saveSettings.mockClear();

      // Test sync on save toggle
      await toggleChangeCallback(true);
      expect(plugin.settings.syncOnSave).toBe(true);
      expect(plugin.saveSettings).toHaveBeenCalled();

      // Reset call count
      plugin.saveSettings.mockClear();

      // Test sync interval slider
      await sliderChangeCallback(15);
      expect(plugin.settings.syncInterval).toBe(15);
      expect(plugin.saveSettings).toHaveBeenCalled();
    } finally {
      // Restore original Setting constructor
      (Setting as any) = originalSetting;
    }
  });
});
