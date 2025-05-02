# Developer Documentation

This document provides technical details about the GitHub Wiki Sync plugin implementation for developers who want to understand or extend the code.

## Architecture Overview

The plugin is structured around a few key components:

1. **Main Plugin Class** (`GitHubWikiSyncPlugin`)
   - Manages plugin lifecycle
   - Handles UI integration with Obsidian
   - Coordinates sync operations

2. **GitHub API Integration**
   - Uses Octokit library to communicate with GitHub
   - Manages authentication and API requests
   - Handles content encoding/decoding

3. **File System Operations**
   - Interfaces with Obsidian's vault API
   - Manages local file reading and writing
   - Handles path conversions

4. **Synchronization Logic**
   - Implements bidirectional sync algorithms
   - Manages conflict resolution
   - Tracks sync state

5. **Settings Management**
   - Stores and retrieves user configuration
   - Provides UI for settings

## Synchronization Implementation

The sync process follows these key principles:

1. **Differential Sync**: Only files that have changed are updated, reducing API calls and improving performance.

2. **Bidirectional Flow**: 
   - First pulls changes from GitHub to local
   - Then pushes local changes to GitHub
   - This ordering minimizes conflicts

3. **Path Management**: Automatically maps between GitHub Wiki page names and Obsidian file paths.

4. **Error Handling**: Catches and manages errors to ensure sync operations are robust.

### Pull Process (GitHub → Obsidian)

The pull process follows these steps:

1. Get list of all wiki pages via GitHub API
2. For each page:
   - Determine the corresponding local path
   - Check if local file exists
   - Compare content if file exists
   - Only write file if content differs or file is missing

### Push Process (Obsidian → GitHub)

The push process follows these steps:

1. Get list of all markdown files in configured directory
2. For each file:
   - Determine the corresponding wiki page name
   - Check if wiki page exists in GitHub
   - Compare content if page exists
   - Create or update page only if needed

## Key Classes and Functions

### GitHubWikiSyncPlugin

Main plugin class that integrates with Obsidian and coordinates operations.

Key methods:
- `onload()`: Initializes plugin
- `syncWithGitHub()`: Performs full bidirectional sync
- `pullFromGitHub()`: Downloads changes from GitHub
- `pushToGitHub()`: Uploads changes to GitHub
- `pushFileToGitHub()`: Syncs an individual file on save

### GitHub API methods

- `getWikiPages()`: Gets list of wiki pages
- `getWikiPageContent()`: Retrieves content of a specific page
- `updateWikiPage()`: Creates or updates a wiki page

### Path conversion methods

- `getLocalPath()`: Converts wiki page name to local file path
- `getWikiName()`: Converts local file path to wiki page name

## Extending the Plugin

To extend the plugin with new features:

1. **Add New Settings**: Extend the `GitHubWikiSyncSettings` interface and update the settings tab.

2. **Add New Commands**: Use Obsidian's `addCommand()` API to add new functionality.

3. **Enhance Sync Logic**: Modify `pullFromGitHub()` or `pushToGitHub()` to handle special cases.

4. **Add UI Components**: Integrate with Obsidian's UI using the available APIs.

## Testing Your Changes

1. Run existing tests:
   ```bash
   npm run test
   ```

2. Add new tests for your changes:
   - Unit tests in `tests/` directory
   - Integration tests in `tests/integration/`
   - Component tests in `tests/components/`

3. Test in Obsidian:
   - Build the plugin: `npm run build`
   - Copy output files to your Obsidian test vault
   - Test functionality in Obsidian

## Common Gotchas

1. **API Rate Limits**: GitHub API has rate limits; handle them gracefully.

2. **File Encoding**: Ensure proper handling of base64 encoding for GitHub content.

3. **Async Operations**: Most operations are asynchronous; use `async/await` appropriately.

4. **Error Handling**: Always catch and handle errors to prevent plugin crashes.

5. **File Path Handling**: Be careful with path separators and encoding in different OS environments.