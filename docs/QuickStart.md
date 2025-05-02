# Quick Start Guide: GitHub Wiki Sync for Obsidian

This quick start guide will help you set up and start using the GitHub Wiki Sync plugin for Obsidian.

## Prerequisites

Before you begin, make sure you have:

- [Obsidian](https://obsidian.md/) installed on your computer
- A [GitHub](https://github.com/) account
- A GitHub repository with a wiki enabled

## Installation

1. Open Obsidian and go to Settings (gear icon in the bottom left)
2. Navigate to "Community plugins" and disable Safe mode if it's enabled
3. Click "Browse" and search for "GitHub Wiki Sync"
4. Click "Install" and then "Enable" to activate the plugin

## Setting Up GitHub Access

To allow the plugin to access your GitHub repository, you need to create a Personal Access Token (PAT):

1. Go to [GitHub Developer Settings](https://github.com/settings/tokens)
2. Click "Generate new token" (classic)
3. Give your token a descriptive name like "Obsidian GitHub Wiki Sync"
4. Under "Select scopes", check the "repo" box to give access to your repositories
5. Click "Generate token"
6. **Important**: Copy the generated token immediately and store it securely. GitHub will only show it once!

## Configuring the Plugin

1. In Obsidian, go to Settings and find "GitHub Wiki Sync" in the Community plugins section
2. Enter the following information:
   - **GitHub Token**: Paste your personal access token
   - **GitHub Username**: Your GitHub username
   - **Repository Name**: The name of your repository (without the .wiki part)
   - **Wiki Folder Path**: (Optional) If you want to store wiki files in a specific folder in your vault, enter the path here. Leave empty to use the root of your vault.
   - **Sync on Save**: Toggle on if you want changes to automatically sync when you save files
   - **Auto Sync Interval**: Set how often (in minutes) you want automatic syncing to occur. Set to 0 to disable.

## Initial Sync

Once configured, you can perform your first sync:

1. Click the sync icon in the left ribbon (looks like a refresh icon)
2. Watch the status bar for progress information
3. After completion, you should see a notification showing how many pages were updated

## Workflow Tips

### Recommended Workflow

1. **Pull First**: Before making major changes, pull the latest changes from GitHub Wiki first
2. **Make Changes**: Edit your notes in Obsidian
3. **Push Changes**: Use the sync button to push your changes back to GitHub Wiki
4. **Check Status**: Look at the status bar to confirm successful synchronization

### Working with Teams

When collaborating with others:

1. Sync frequently to avoid merge conflicts
2. Consider using a dedicated folder for wiki content to keep it organized
3. Communicate with team members about when you're making substantial changes

### Troubleshooting

If you encounter issues:

1. Check your GitHub token has the correct permissions
2. Verify your username and repository name are correct
3. Look at the console (Ctrl+Shift+I in Obsidian) for error messages
4. Try disabling and re-enabling the plugin

## Using Context7 and Perplexity

### Enhancing Documentation with Context7

1. Sync your Obsidian notes with GitHub Wiki using this plugin
2. Sign up for [Context7](https://context7.com) and connect your GitHub repository
3. Use Context7's analytics to identify areas where documentation can be improved
4. Make those improvements in Obsidian and sync again

### Researching with Perplexity

1. When you need to add new documentation, use [Perplexity](https://www.perplexity.ai) to research the topic
2. Create a new note in Obsidian with the research findings
3. Format your note according to your documentation standards
4. Sync the new note to your GitHub Wiki

## Next Steps

- Customize your wiki organization structure
- Set up templates for consistent documentation
- Create an index page to help navigate your wiki
- Use Obsidian links to create connections between wiki pages

For more detailed information, check the main [README](../README.md) file.