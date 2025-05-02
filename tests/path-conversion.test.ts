/**
 * Test file for path conversion utilities
 */

import { App } from 'obsidian';

import GitHubWikiSyncPlugin from '../main';

describe('Path Conversion Utilities', () => {
  let app: App;
  let plugin: GitHubWikiSyncPlugin;

  beforeEach(() => {
    // Set up app and plugin
    app = new App();
    plugin = new GitHubWikiSyncPlugin(app, '');

    // Initialize settings
    plugin.settings = {
      githubToken: 'mock-token',
      githubUsername: 'test-user',
      repositoryName: 'test-repo',
      wikiPath: 'wiki',
      syncOnSave: false,
      syncInterval: 0,
      lastSyncTimestamp: 0,
    };
  });

  describe('getLocalPath', () => {
    it('should convert wiki name to local path with wiki folder', () => {
      expect(plugin.getLocalPath('Home')).toBe('wiki/Home.md');
      expect(plugin.getLocalPath('Features')).toBe('wiki/Features.md');
      expect(plugin.getLocalPath('Advanced/Setup')).toBe('wiki/Advanced/Setup.md');
    });

    it('should handle empty wiki path setting', () => {
      plugin.settings.wikiPath = '';
      expect(plugin.getLocalPath('Home')).toBe('Home.md');
      expect(plugin.getLocalPath('Features')).toBe('Features.md');
    });

    it('should handle root wiki path', () => {
      plugin.settings.wikiPath = '/';
      expect(plugin.getLocalPath('Home')).toBe('/Home.md');
    });

    it('should handle wiki path with trailing slash', () => {
      plugin.settings.wikiPath = 'wiki/';
      expect(plugin.getLocalPath('Home')).toBe('wiki/Home.md');
      expect(plugin.getLocalPath('Features')).toBe('wiki/Features.md');
    });

    it('should handle nested wiki paths', () => {
      plugin.settings.wikiPath = 'notes/wiki';
      expect(plugin.getLocalPath('Home')).toBe('notes/wiki/Home.md');
      expect(plugin.getLocalPath('Features')).toBe('notes/wiki/Features.md');
    });

    it('should handle wiki names with special characters', () => {
      expect(plugin.getLocalPath('Getting Started')).toBe('wiki/Getting Started.md');
      expect(plugin.getLocalPath('Code-Examples')).toBe('wiki/Code-Examples.md');
      expect(plugin.getLocalPath('Q&A')).toBe('wiki/Q&A.md');
    });
  });

  describe('getWikiName', () => {
    it('should convert local path to wiki name with wiki folder', () => {
      expect(plugin.getWikiName('wiki/Home.md')).toBe('Home');
      expect(plugin.getWikiName('wiki/Features.md')).toBe('Features');
      expect(plugin.getWikiName('wiki/Advanced/Setup.md')).toBe('Advanced/Setup');
    });

    it('should handle paths without wiki folder when wiki path is empty', () => {
      plugin.settings.wikiPath = '';
      expect(plugin.getWikiName('Home.md')).toBe('Home');
      expect(plugin.getWikiName('Features.md')).toBe('Features');
      expect(plugin.getWikiName('Advanced/Setup.md')).toBe('Advanced/Setup');
    });

    it('should handle root wiki path', () => {
      plugin.settings.wikiPath = '/';
      expect(plugin.getWikiName('/Home.md')).toBe('Home');
      expect(plugin.getWikiName('Home.md')).toBe('Home');
    });

    it('should handle wiki path with trailing slash', () => {
      plugin.settings.wikiPath = 'wiki/';
      expect(plugin.getWikiName('wiki/Home.md')).toBe('Home');
      expect(plugin.getWikiName('wiki/Features.md')).toBe('Features');
    });

    it('should handle nested wiki paths', () => {
      plugin.settings.wikiPath = 'notes/wiki';
      expect(plugin.getWikiName('notes/wiki/Home.md')).toBe('Home');
      expect(plugin.getWikiName('notes/wiki/Features.md')).toBe('Features');
    });

    it('should handle local paths with special characters', () => {
      expect(plugin.getWikiName('wiki/Getting Started.md')).toBe('Getting Started');
      expect(plugin.getWikiName('wiki/Code-Examples.md')).toBe('Code-Examples');
      expect(plugin.getWikiName('wiki/Q&A.md')).toBe('Q&A');
    });

    it('should handle paths without .md extension', () => {
      expect(plugin.getWikiName('wiki/Home')).toBe('Home');
      expect(plugin.getWikiName('wiki/Features')).toBe('Features');
    });

    it('should handle paths outside wiki folder when wiki path is set', () => {
      expect(plugin.getWikiName('other/Home.md')).toBe('other/Home');
    });

    it('should handle empty path', () => {
      expect(plugin.getWikiName('')).toBe('');
    });
  });

  describe('Path conversion roundtrip', () => {
    it('should correctly roundtrip wiki name to local path and back', () => {
      const wikiNames = [
        'Home',
        'Features',
        'Advanced/Setup',
        'Getting Started',
        'Code-Examples',
        'Q&A',
      ];

      for (const name of wikiNames) {
        const localPath = plugin.getLocalPath(name);
        const roundtrip = plugin.getWikiName(localPath);
        expect(roundtrip).toBe(name);
      }
    });

    it('should correctly roundtrip local path to wiki name and back', () => {
      const localPaths = [
        'wiki/Home.md',
        'wiki/Features.md',
        'wiki/Advanced/Setup.md',
        'wiki/Getting Started.md',
        'wiki/Code-Examples.md',
        'wiki/Q&A.md',
      ];

      for (const path of localPaths) {
        const wikiName = plugin.getWikiName(path);
        const roundtrip = plugin.getLocalPath(wikiName);
        expect(roundtrip).toBe(path);
      }
    });

    it('should handle roundtrip with different wiki path settings', () => {
      // Test with empty wiki path
      plugin.settings.wikiPath = '';
      expect(plugin.getWikiName(plugin.getLocalPath('Home'))).toBe('Home');

      // Test with root wiki path
      plugin.settings.wikiPath = '/';
      expect(plugin.getWikiName(plugin.getLocalPath('Home'))).toBe('Home');

      // Test with nested wiki path
      plugin.settings.wikiPath = 'notes/wiki';
      expect(plugin.getWikiName(plugin.getLocalPath('Home'))).toBe('Home');
    });
  });
});
