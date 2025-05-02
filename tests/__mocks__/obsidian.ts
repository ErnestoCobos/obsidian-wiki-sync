// Mock for obsidian API
export class App {
  vault = {
    adapter: {
      exists: jest.fn().mockResolvedValue(true),
      read: jest.fn().mockResolvedValue('# Test Content'),
      write: jest.fn().mockResolvedValue(undefined),
    },
    createFolder: jest.fn().mockResolvedValue(undefined),
    getMarkdownFiles: jest.fn().mockResolvedValue([
      {
        path: 'test.md',
        name: 'test.md',
        extension: 'md',
      },
    ]),
    read: jest.fn().mockResolvedValue('# Test Content'),
    on: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
  };
  workspace = {
    getActiveViewOfType: jest.fn(),
  };
}

export class Plugin {
  settings = {};
  loadData = jest.fn().mockResolvedValue({});
  saveData = jest.fn().mockResolvedValue(undefined);
  addRibbonIcon = jest.fn().mockReturnValue({
    addClass: jest.fn(),
  });
  addStatusBarItem = jest.fn().mockReturnValue({
    setText: jest.fn(),
  });
  addCommand = jest.fn();
  addSettingTab = jest.fn();
  registerEvent = jest.fn();
  registerInterval = jest.fn();
  registerDomEvent = jest.fn();
}

export class PluginSettingTab {
  constructor(app, plugin) {
    this.app = app;
    this.plugin = plugin;
  }
  containerEl = {
    empty: jest.fn(),
    createEl: jest.fn(),
  };
}

export class Setting {
  constructor(containerEl) {
    this.containerEl = containerEl;
  }
  setName = jest.fn().mockReturnThis();
  setDesc = jest.fn().mockReturnThis();
  addText = jest.fn().mockImplementation((cb) => {
    cb({
      setPlaceholder: jest.fn().mockReturnThis(),
      setValue: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockReturnThis(),
    });
    return this;
  });
  addToggle = jest.fn().mockImplementation((cb) => {
    cb({
      setValue: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockReturnThis(),
    });
    return this;
  });
  addSlider = jest.fn().mockImplementation((cb) => {
    cb({
      setLimits: jest.fn().mockReturnThis(),
      setValue: jest.fn().mockReturnThis(),
      setDynamicTooltip: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockReturnThis(),
    });
    return this;
  });
  addButton = jest.fn().mockImplementation((cb) => {
    cb({
      setButtonText: jest.fn().mockReturnThis(),
      setCta: jest.fn().mockReturnThis(),
      setDisabled: jest.fn().mockReturnThis(),
      onClick: jest.fn().mockReturnThis(),
    });
    return this;
  });
}

export class Notice {
  constructor(message) {
    this.message = message;
  }
}

export class TFile {
  constructor(path, name) {
    this.path = path;
    this.name = name;
    this.extension = path.split('.').pop();
  }
}

export class MarkdownView {
  constructor() {
    this.editor = {
      getSelection: jest.fn().mockReturnValue(''),
      replaceSelection: jest.fn(),
    };
  }
}

export class Modal {
  constructor(app) {
    this.app = app;
  }
  contentEl = {
    setText: jest.fn(),
    empty: jest.fn(),
  };
  open = jest.fn();
  close = jest.fn();
}

export const normalizePath = (path) => path;