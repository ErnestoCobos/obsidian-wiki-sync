/**
 * End-to-End tests for the GitHub Wiki Sync Plugin
 * Tests the complete synchronization flow between Obsidian and GitHub
 */

import { E2ETestEnvironment, createStandardE2EEnvironment } from './setup';

describe('GitHub Wiki Sync E2E Flow', () => {
  let env: E2ETestEnvironment;
  
  beforeEach(() => {
    // Set up a fresh environment before each test
    env = createStandardE2EEnvironment();
  });
  
  afterEach(() => {
    // Clean up after each test
    env.reset();
  });
  
  test('Pull from GitHub brings in new remote files', async () => {
    // Initially, local has 2 files, remote has 3 files
    expect(env.localFiles.size).toBe(2);
    expect(env.remoteFiles.size).toBe(3);
    
    // Execute pull operation
    await env.performPull();
    
    // Should now have 3 files locally
    expect(env.localFiles.size).toBe(3);
    
    // Verify the new file was pulled correctly
    const setupFile = env.getLocalFile('wiki/Setup.md');
    expect(setupFile).toBe('# Setup\nInstructions for setting up the project');
  });
  
  test('Push to GitHub sends local changes to remote', async () => {
    // Add a new local file
    env.addLocalFile('wiki/NewPage.md', '# New Page\nThis is a new page created locally');
    
    // Execute push operation
    await env.performPush();
    
    // Remote should now have the new file
    const newPageRemote = env.getRemoteFile('NewPage.md');
    expect(newPageRemote).toBe('# New Page\nThis is a new page created locally');
  });
  
  test('Full sync performs bidirectional synchronization', async () => {
    // Add a unique file to local storage
    env.addLocalFile('wiki/LocalOnly.md', '# Local File\nThis file only exists locally');
    
    // Add a unique file to remote storage
    env.addRemoteFile('RemoteOnly.md', '# Remote File\nThis file only exists remotely');
    
    // Perform full sync
    await env.performFullSync();
    
    // Both files should now exist in both locations
    expect(env.getLocalFile('wiki/RemoteOnly.md')).toBe('# Remote File\nThis file only exists remotely');
    expect(env.getRemoteFile('LocalOnly.md')).toBe('# Local File\nThis file only exists locally');
  });
  
  test('Modified files are synchronized correctly', async () => {
    // Modify a file locally that exists in both places
    env.addLocalFile('wiki/Features.md', '# Features\n- Feature 1\n- Feature 2\n- NEW Feature 3');
    
    // Perform full sync
    await env.performFullSync();
    
    // Remote should have the updated content
    const remoteFeatures = env.getRemoteFile('Features.md');
    expect(remoteFeatures).toBe('# Features\n- Feature 1\n- Feature 2\n- NEW Feature 3');
    
    // Now modify a file remotely
    env.addRemoteFile('Home.md', '# Wiki Home\nWelcome to the test wiki!\nNEW LINE HERE');
    
    // Perform full sync again
    await env.performFullSync();
    
    // Local should have the updated content
    const localHome = env.getLocalFile('wiki/Home.md');
    expect(localHome).toBe('# Wiki Home\nWelcome to the test wiki!\nNEW LINE HERE');
  });
  
  test('File with same content is not updated during sync', async () => {
    // Get mock functions to check call counts
    const writeLocalFile = env.app.vault.adapter.write as jest.Mock;
    const updateRemoteFile = env.plugin.octokit?.rest.repos.createOrUpdateFileContents as jest.Mock;
    
    // Reset call counts
    writeLocalFile.mockClear();
    updateRemoteFile.mockClear();
    
    // Execute full sync with no changes
    await env.performFullSync();
    
    // No files should be written since content is identical
    expect(writeLocalFile).not.toHaveBeenCalled();
    expect(updateRemoteFile).not.toHaveBeenCalled();
  });
  
  test('Conflict resolution: remote changes take precedence on pull', async () => {
    // Modify the same file differently in both locations
    env.addLocalFile('wiki/Features.md', '# Features\n- LOCAL: Feature 1\n- Feature 2');
    env.addRemoteFile('Features.md', '# Features\n- REMOTE: Feature 1\n- Feature 2');
    
    // Execute pull operation
    await env.performPull();
    
    // Remote version should overwrite local
    const localFeatures = env.getLocalFile('wiki/Features.md');
    expect(localFeatures).toBe('# Features\n- REMOTE: Feature 1\n- Feature 2');
  });
  
  test('Conflict resolution: local changes take precedence on push', async () => {
    // Modify the same file differently in both locations
    env.addLocalFile('wiki/Features.md', '# Features\n- LOCAL: Feature 1\n- Feature 2');
    env.addRemoteFile('Features.md', '# Features\n- REMOTE: Feature 1\n- Feature 2');
    
    // Execute push operation
    await env.performPush();
    
    // Local version should overwrite remote
    const remoteFeatures = env.getRemoteFile('Features.md');
    expect(remoteFeatures).toBe('# Features\n- LOCAL: Feature 1\n- Feature 2');
  });
  
  test('Wiki path is respected during sync operations', async () => {
    // Change wiki path to a different directory
    env.plugin.settings.wikiPath = 'docs';
    
    // Add a file to the new wiki path
    env.addLocalFile('docs/NewDoc.md', '# New Document\nIn a different wiki path');
    
    // Push to GitHub
    await env.performPush();
    
    // Remote should have the new file
    const remoteDoc = env.getRemoteFile('NewDoc.md');
    expect(remoteDoc).toBe('# New Document\nIn a different wiki path');
    
    // Remote file should be mapped to correct local path on pull
    env.addRemoteFile('AnotherDoc.md', '# Another Document\nCreated on remote');
    
    // Pull from GitHub
    await env.performPull();
    
    // Local should have new file in the correct location
    const localDoc = env.getLocalFile('docs/AnotherDoc.md');
    expect(localDoc).toBe('# Another Document\nCreated on remote');
  });
});