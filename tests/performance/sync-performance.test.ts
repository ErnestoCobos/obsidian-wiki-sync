import { App, TFile } from 'obsidian';
import GitHubWikiSyncPlugin from '../../main';
import { Octokit } from '@octokit/rest';

// Create a performance mock for GitHub API that simulates a large wiki
jest.mock('@octokit/rest', () => {
  // Generate a large number of mock files
  const generateMockFiles = (count: number) => {
    const tree = [];
    for (let i = 0; i < count; i++) {
      tree.push({
        path: `File${i}.md`,
        sha: `sha-${i}`
      });
    }
    return tree;
  };
  
  // Create mock file content
  const createMockContent = (index: number) => {
    return Buffer.from(`# File ${index}\nThis is the content for file ${index}.`).toString('base64');
  };
  
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        rest: {
          git: {
            getTree: jest.fn().mockImplementation(() => {
              const tree = generateMockFiles(100); // 100 mock files for testing
              return Promise.resolve({
                data: { tree }
              });
            })
          },
          repos: {
            getContent: jest.fn().mockImplementation(({ path }) => {
              const index = parseInt(path.replace(/[^0-9]/g, '')) || 0;
              return Promise.resolve({
                data: {
                  content: createMockContent(index),
                  sha: `sha-${index}`
                }
              });
            }),
            createOrUpdateFileContents: jest.fn().mockResolvedValue({})
          }
        }
      };
    })
  };
});

// Mock Obsidian's Vault to track performance metrics
class PerformanceTrackedVault {
  fileReadTimes: number[] = [];
  fileWriteTimes: number[] = [];
  
  adapter = {
    exists: jest.fn().mockResolvedValue(false),
    read: jest.fn().mockImplementation(async (path: string) => {
      const startTime = performance.now();
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1));
      const endTime = performance.now();
      this.fileReadTimes.push(endTime - startTime);
      return `# Mock content for ${path}`;
    }),
    write: jest.fn().mockImplementation(async (path: string, content: string) => {
      const startTime = performance.now();
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1));
      const endTime = performance.now();
      this.fileWriteTimes.push(endTime - startTime);
      return;
    })
  };
  
  createFolder = jest.fn().mockResolvedValue(undefined);
  
  getMarkdownFiles = jest.fn().mockImplementation(() => {
    // Generate 100 mock files
    const files: TFile[] = [];
    for (let i = 0; i < 100; i++) {
      files.push({
        path: `wiki/File${i}.md`,
        name: `File${i}.md`,
        extension: 'md'
      } as TFile);
    }
    return files;
  });
  
  read = jest.fn().mockImplementation(async (file: TFile) => {
    const startTime = performance.now();
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1));
    const endTime = performance.now();
    this.fileReadTimes.push(endTime - startTime);
    return `# Mock content for ${file.path}`;
  });
  
  // Event handling
  on = jest.fn().mockReturnValue({ unsubscribe: jest.fn() });
  
  // For analysis
  getAverageReadTime() {
    if (this.fileReadTimes.length === 0) return 0;
    const sum = this.fileReadTimes.reduce((a, b) => a + b, 0);
    return sum / this.fileReadTimes.length;
  }
  
  getAverageWriteTime() {
    if (this.fileWriteTimes.length === 0) return 0;
    const sum = this.fileWriteTimes.reduce((a, b) => a + b, 0);
    return sum / this.fileWriteTimes.length;
  }
  
  getTotalReadTime() {
    return this.fileReadTimes.reduce((a, b) => a + b, 0);
  }
  
  getTotalWriteTime() {
    return this.fileWriteTimes.reduce((a, b) => a + b, 0);
  }
}

describe('Sync Performance Tests', () => {
  let app: App;
  let plugin: GitHubWikiSyncPlugin;
  let mockVault: PerformanceTrackedVault;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock vault with performance tracking
    mockVault = new PerformanceTrackedVault();
    
    // Create mock app
    app = {
      vault: mockVault as any
    } as App;
    
    // Create plugin with mocked components
    plugin = new GitHubWikiSyncPlugin(app, '');
    
    // Mock DOM-related methods
    plugin.statusBarItem = { setText: jest.fn() } as any;
    plugin.updateStatusBarItem = jest.fn();
    plugin.saveSettings = jest.fn().mockResolvedValue(undefined);
    
    // Configure plugin settings
    plugin.settings = {
      githubToken: 'mock-token',
      githubUsername: 'user',
      repositoryName: 'repo',
      wikiPath: 'wiki',
      syncOnSave: false,
      syncInterval: 0,
      lastSyncTimestamp: 0
    };
    
    // Initialize GitHub client
    plugin.initializeGitHub();
  });
  
  test('Pull performance with 100 wiki pages', async () => {
    const startTime = performance.now();
    
    await plugin.pullFromGitHub();
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Log performance metrics
    console.log(`Pull Performance Metrics:
      Total time: ${totalTime.toFixed(2)}ms
      Number of files: 100
      Average read time: ${mockVault.getAverageReadTime().toFixed(2)}ms
      Average write time: ${mockVault.getAverageWriteTime().toFixed(2)}ms
      Total read time: ${mockVault.getTotalReadTime().toFixed(2)}ms
      Total write time: ${mockVault.getTotalWriteTime().toFixed(2)}ms
    `);
    
    // Verify reasonable performance
    expect(totalTime).toBeLessThan(10000); // Should complete in under 10 seconds
    
    // Number of write operations should be close to 100
    // (May be less if some mock files had matching content)
    expect(mockVault.adapter.write).toHaveBeenCalled();
  });
  
  test('Push performance with 100 local pages', async () => {
    const startTime = performance.now();
    
    await plugin.pushToGitHub();
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Log performance metrics
    console.log(`Push Performance Metrics:
      Total time: ${totalTime.toFixed(2)}ms
      Number of files: 100
      Average read time: ${mockVault.getAverageReadTime().toFixed(2)}ms
      Total read time: ${mockVault.getTotalReadTime().toFixed(2)}ms
    `);
    
    // Verify reasonable performance
    expect(totalTime).toBeLessThan(10000); // Should complete in under 10 seconds
    
    // Number of read operations should match the number of files
    expect(mockVault.read).toHaveBeenCalledTimes(100);
  });
});