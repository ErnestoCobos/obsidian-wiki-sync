import { Octokit } from '@octokit/rest';
import { App, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

interface GitHubWikiSyncSettings {
  githubToken: string;
  githubUsername: string;
  repositoryName: string;
  wikiPath: string;
  syncOnSave: boolean;
  syncInterval: number; // in minutes, 0 means no auto sync
  lastSyncTimestamp: number;
}

const DEFAULT_SETTINGS: GitHubWikiSyncSettings = {
  githubToken: '',
  githubUsername: '',
  repositoryName: '',
  wikiPath: '',
  syncOnSave: false,
  syncInterval: 0,
  lastSyncTimestamp: 0,
};

export default class GitHubWikiSyncPlugin extends Plugin {
  settings: GitHubWikiSyncSettings;
  octokit: Octokit | null = null;
  statusBarItem: HTMLElement;
  syncIntervalId: number | null = null;

  async onload() {
    await this.loadSettings();
    this.initializeGitHub();

    // Add ribbon icon for manual sync
    const ribbonIconEl = this.addRibbonIcon('refresh-cw', 'Sync with GitHub Wiki', async () => {
      await this.syncWithGitHub();
    });
    ribbonIconEl.addClass('github-wiki-sync-ribbon-class');

    // Status bar item to show sync status
    this.statusBarItem = this.addStatusBarItem();
    this.updateStatusBarItem();

    // Add commands
    this.addCommand({
      id: 'sync-with-github',
      name: 'Sync with GitHub Wiki',
      callback: async () => {
        await this.syncWithGitHub();
      },
    });

    this.addCommand({
      id: 'pull-from-github',
      name: 'Pull from GitHub Wiki',
      callback: async () => {
        await this.pullFromGitHub();
      },
    });

    this.addCommand({
      id: 'push-to-github',
      name: 'Push to GitHub Wiki',
      callback: async () => {
        await this.pushToGitHub();
      },
    });

    // Setup sync on file save if enabled
    if (this.settings.syncOnSave) {
      this.registerEvent(
        this.app.vault.on('modify', file => {
          if (file instanceof TFile && file.extension === 'md') {
            void this.pushFileToGitHub(file);
          }
        })
      );
    }

    // Setup auto sync if interval is set
    this.setupAutoSync();

    // Add settings tab
    this.addSettingTab(new GitHubWikiSyncSettingTab(this.app, this));
  }

  onunload() {
    if (this.syncIntervalId) {
      window.clearInterval(this.syncIntervalId);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.initializeGitHub();
    this.setupAutoSync();
  }

  initializeGitHub() {
    if (this.settings.githubToken) {
      this.octokit = new Octokit({
        auth: this.settings.githubToken,
      });
      this.updateStatusBarItem();
    } else {
      this.octokit = null;
      this.updateStatusBarItem('Not configured');
    }
  }

  setupAutoSync() {
    // Clear existing interval if it exists
    if (this.syncIntervalId) {
      window.clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }

    // Set up new interval if enabled
    if (this.settings.syncInterval > 0) {
      this.syncIntervalId = window.setInterval(
        () => {
          void this.syncWithGitHub();
        },
        this.settings.syncInterval * 60 * 1000
      );
    }
  }

  updateStatusBarItem(text?: string) {
    if (text) {
      this.statusBarItem.setText(`GitHub Wiki: ${text}`);
    } else if (!this.octokit) {
      this.statusBarItem.setText('GitHub Wiki: Not configured');
    } else if (this.settings.lastSyncTimestamp) {
      const lastSync = new Date(this.settings.lastSyncTimestamp);
      this.statusBarItem.setText(`GitHub Wiki: Last sync ${lastSync.toLocaleTimeString()}`);
    } else {
      this.statusBarItem.setText('GitHub Wiki: Never synced');
    }
  }

  async syncWithGitHub() {
    if (!this.octokit) {
      new Notice('Please configure GitHub token in settings');
      return;
    }

    this.updateStatusBarItem('Syncing...');
    try {
      await this.pullFromGitHub();
      await this.pushToGitHub();

      this.settings.lastSyncTimestamp = Date.now();
      await this.saveSettings();
      this.updateStatusBarItem();
      new Notice('Successfully synced with GitHub Wiki');
    } catch (error: any) {
      console.error('Error syncing with GitHub Wiki:', error);
      this.updateStatusBarItem('Sync failed');
      new Notice(`Failed to sync with GitHub Wiki: ${error.message}`);
    }
  }

  async pullFromGitHub() {
    if (!this.octokit) {
      new Notice('Please configure GitHub token in settings');
      return;
    }

    this.updateStatusBarItem('Pulling...');
    try {
      // Get list of wiki pages
      const wikiPages = await this.getWikiPages();

      // Create local directory if it doesn't exist
      const wikiFolder = this.settings.wikiPath || '';
      if (wikiFolder && !(await this.app.vault.adapter.exists(wikiFolder))) {
        await this.app.vault.createFolder(wikiFolder);
      }

      // Download each wiki page and save locally
      let updatedCount = 0;
      for (const page of wikiPages) {
        try {
          const pageContent = await this.getWikiPageContent(page.name);
          const localPath = this.getLocalPath(page.name);

          // Check if file exists and content is different
          let shouldUpdate = true;
          if (await this.app.vault.adapter.exists(localPath)) {
            const currentContent = await this.app.vault.adapter.read(localPath);
            if (currentContent === pageContent) {
              shouldUpdate = false;
            }
          }

          if (shouldUpdate) {
            await this.app.vault.adapter.write(localPath, pageContent);
            updatedCount++;
          }
        } catch (error: any) {
          console.error(`Error pulling page ${page.name}:`, error);
          // Continue with other pages even if one fails
        }
      }

      new Notice(`Pulled ${updatedCount} updated pages from GitHub Wiki`);
      this.updateStatusBarItem();
    } catch (error: any) {
      console.error('Error pulling from GitHub Wiki:', error);
      this.updateStatusBarItem('Pull failed');
      new Notice(`Failed to pull from GitHub Wiki: ${error.message}`);
    }
  }

  async pushToGitHub() {
    if (!this.octokit) {
      new Notice('Please configure GitHub token in settings');
      return;
    }

    this.updateStatusBarItem('Pushing...');
    try {
      // Get list of markdown files in the specified directory
      const wikiFolder = this.settings.wikiPath || '';
      const files = this.app.vault.getMarkdownFiles();

      const filteredFiles = wikiFolder
        ? files.filter(
            file =>
              file.path.startsWith(wikiFolder) || (wikiFolder === '/' && !file.path.includes('/'))
          )
        : files;

      // Push each file to GitHub Wiki
      let updatedCount = 0;
      for (const file of filteredFiles) {
        try {
          const fileContent = await this.app.vault.read(file);
          const wikiName = this.getWikiName(file.path);

          // Check if wiki page exists and content is different
          let shouldUpdate = true;
          try {
            const currentContent = await this.getWikiPageContent(wikiName);
            if (currentContent === fileContent) {
              shouldUpdate = false;
            }
          } catch (error: any) {
            // Page doesn't exist, will create it
          }

          if (shouldUpdate) {
            await this.updateWikiPage(wikiName, fileContent);
            updatedCount++;
          }
        } catch (error: any) {
          console.error(`Error pushing file ${file.path}:`, error);
          // Continue with other files even if one fails
        }
      }

      new Notice(`Pushed ${updatedCount} updated pages to GitHub Wiki`);
      this.updateStatusBarItem();
    } catch (error: any) {
      console.error('Error pushing to GitHub Wiki:', error);
      this.updateStatusBarItem('Push failed');
      new Notice(`Failed to push to GitHub Wiki: ${error.message}`);
    }
  }

  async pushFileToGitHub(file: TFile) {
    if (!this.octokit || file.extension !== 'md') {
      return;
    }

    // Check if file is in the wiki directory
    const wikiFolder = this.settings.wikiPath || '';
    if (wikiFolder && !file.path.startsWith(wikiFolder)) {
      return;
    }

    try {
      const fileContent = await this.app.vault.read(file);
      const wikiName = this.getWikiName(file.path);

      await this.updateWikiPage(wikiName, fileContent);
      this.settings.lastSyncTimestamp = Date.now();
      await this.saveSettings();
      this.updateStatusBarItem();
      new Notice(`Pushed ${file.name} to GitHub Wiki`);
    } catch (error: any) {
      console.error('Error pushing file to GitHub Wiki:', error);
      new Notice(`Failed to push ${file.name} to GitHub Wiki: ${error.message}`);
    }
  }

  // Helper methods for interacting with GitHub API
  async getWikiPages() {
    if (!this.octokit) return [];

    // Use the git data API to list all files in the wiki repo
    const response = await this.octokit.rest.git.getTree({
      owner: this.settings.githubUsername || '',
      repo: `${this.settings.repositoryName || ''}.wiki`,
      tree_sha: 'master', // Most wikis use master branch
      recursive: '1',
    });

    // Filter to only include markdown files
    return response.data.tree
      .filter(item => item.path && item.path.endsWith('.md'))
      .map(item => ({
        name: item.path?.replace(/\.md$/, '') || '',
        path: item.path || '',
        sha: item.sha || '',
      }));
  }

  async getWikiPageContent(pageName: string) {
    if (!this.octokit) return '';

    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.settings.githubUsername || '',
        repo: `${this.settings.repositoryName || ''}.wiki`,
        path: `${pageName}.md`,
      });

      // Check if we got a file or a directory
      if (Array.isArray(response.data)) {
        throw new Error('Expected a file but got a directory');
      } else if ('content' in response.data && response.data.content) {
        // GitHub API returns content as base64
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      } else {
        throw new Error('Response does not contain content');
      }
    } catch (error: any) {
      console.error(`Error getting wiki page content for ${pageName}:`, error);
      throw error;
    }
  }

  async updateWikiPage(pageName: string, content: string) {
    if (!this.octokit) return;

    try {
      // Try to get existing content first to get the SHA
      const existingFile = await this.octokit.rest.repos.getContent({
        owner: this.settings.githubUsername || '',
        repo: `${this.settings.repositoryName || ''}.wiki`,
        path: `${pageName}.md`,
      });

      // Check if we got a file (not a directory)
      if (Array.isArray(existingFile.data)) {
        throw new Error('Expected a file but got a directory');
      }

      // Make sure we have the sha property
      if (!('sha' in existingFile.data)) {
        throw new Error('Response does not contain sha');
      }

      // Update existing file
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.settings.githubUsername || '',
        repo: `${this.settings.repositoryName || ''}.wiki`,
        path: `${pageName}.md`,
        message: `Update ${pageName} via Obsidian GitHub Wiki Sync plugin`,
        content: Buffer.from(content).toString('base64'),
        sha: existingFile.data.sha,
      });
    } catch (error: any) {
      // File doesn't exist or other error occurred
      if (error.status === 404) {
        // Create new file
        await this.octokit.rest.repos.createOrUpdateFileContents({
          owner: this.settings.githubUsername || '',
          repo: `${this.settings.repositoryName || ''}.wiki`,
          path: `${pageName}.md`,
          message: `Create ${pageName} via Obsidian GitHub Wiki Sync plugin`,
          content: Buffer.from(content).toString('base64'),
        });
      } else {
        // Other error, re-throw
        console.error(`Error updating wiki page ${pageName}:`, error);
        throw error;
      }
    }
  }

  // Helper methods for path conversion
  getLocalPath(wikiName: string): string {
    const wikiFolder = this.settings.wikiPath ? `${this.settings.wikiPath}/` : '';
    return `${wikiFolder}${wikiName}.md`;
  }

  getWikiName(filePath: string): string {
    const wikiFolder = this.settings.wikiPath || '';
    let fileName = filePath;

    // Remove wiki folder prefix if it exists
    if (wikiFolder && filePath.startsWith(wikiFolder)) {
      fileName = filePath.substring(wikiFolder.length);
      if (fileName.startsWith('/')) {
        fileName = fileName.substring(1);
      }
    }

    // Remove .md extension
    if (fileName.endsWith('.md')) {
      fileName = fileName.substring(0, fileName.length - 3);
    }

    return fileName;
  }
}

class GitHubWikiSyncSettingTab extends PluginSettingTab {
  plugin: GitHubWikiSyncPlugin;

  constructor(app: App, plugin: GitHubWikiSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'GitHub Wiki Sync Settings' });

    new Setting(containerEl)
      .setName('GitHub Token')
      .setDesc('Personal access token with repo permissions')
      .addText(text =>
        text
          .setPlaceholder('ghp_xxxxxxxxxxxxxxxxxxxx')
          .setValue(this.plugin.settings.githubToken)
          .onChange(async value => {
            this.plugin.settings.githubToken = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('GitHub Username')
      .setDesc('Your GitHub username')
      .addText(text =>
        text
          .setPlaceholder('username')
          .setValue(this.plugin.settings.githubUsername)
          .onChange(async value => {
            this.plugin.settings.githubUsername = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Repository Name')
      .setDesc('The repository name without the .wiki part')
      .addText(text =>
        text
          .setPlaceholder('repository-name')
          .setValue(this.plugin.settings.repositoryName)
          .onChange(async value => {
            this.plugin.settings.repositoryName = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Wiki Folder Path')
      .setDesc('Path to the folder where wiki files will be stored (leave empty for root)')
      .addText(text =>
        text
          .setPlaceholder('wiki')
          .setValue(this.plugin.settings.wikiPath)
          .onChange(async value => {
            this.plugin.settings.wikiPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Sync on Save')
      .setDesc('Automatically push changes to GitHub when files are saved')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.syncOnSave).onChange(async value => {
          this.plugin.settings.syncOnSave = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Auto Sync Interval')
      .setDesc('Automatically sync with GitHub at regular intervals (in minutes, 0 to disable)')
      .addSlider(slider =>
        slider
          .setLimits(0, 60, 5)
          .setValue(this.plugin.settings.syncInterval)
          .setDynamicTooltip()
          .onChange(async value => {
            this.plugin.settings.syncInterval = value;
            await this.plugin.saveSettings();
          })
      );

    if (this.plugin.settings.lastSyncTimestamp) {
      const lastSync = new Date(this.plugin.settings.lastSyncTimestamp);
      containerEl.createEl('div', {
        text: `Last synchronized: ${lastSync.toLocaleString()}`,
        cls: 'setting-item-description',
      });
    }

    new Setting(containerEl)
      .setName('Sync Now')
      .setDesc('Manually sync with GitHub Wiki')
      .addButton(button =>
        button
          .setButtonText('Sync')
          .setCta()
          .onClick(async () => {
            button.setDisabled(true);
            button.setButtonText('Syncing...');
            try {
              await this.plugin.syncWithGitHub();
              button.setButtonText('Done!');
              setTimeout(() => {
                button.setButtonText('Sync');
                button.setDisabled(false);
                this.display();
              }, 2000);
            } catch (error) {
              button.setButtonText('Failed');
              setTimeout(() => {
                button.setButtonText('Sync');
                button.setDisabled(false);
              }, 2000);
            }
          })
      );
  }
}
