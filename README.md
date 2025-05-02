# GitHub Wiki Sync for Obsidian

[![Build and Test](https://github.com/ErnestoCobos/obsidian-wiki-sync/actions/workflows/build-test.yml/badge.svg)](https://github.com/ErnestoCobos/obsidian-wiki-sync/actions/workflows/build-test.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ErnestoCobos/obsidian-wiki-sync)](https://github.com/ErnestoCobos/obsidian-wiki-sync/releases/latest)
[![GitHub license](https://img.shields.io/github/license/ErnestoCobos/obsidian-wiki-sync)](https://github.com/ErnestoCobos/obsidian-wiki-sync/blob/main/LICENSE)
[![Code Coverage](https://raw.githubusercontent.com/ErnestoCobos/obsidian-wiki-sync/main/coverage/badge.svg)](https://codecov.io/gh/ErnestoCobos/obsidian-wiki-sync)
[![codecov](https://codecov.io/gh/ErnestoCobos/obsidian-wiki-sync/branch/main/graph/badge.svg)](https://codecov.io/gh/ErnestoCobos/obsidian-wiki-sync)

This plugin allows you to synchronize your Obsidian vault with GitHub Wiki repositories. It provides bidirectional sync between your local Obsidian notes and a GitHub Wiki, making it easy to collaborate with others or maintain documentation using Obsidian.

## Repository

The source code for this plugin is available on GitHub:
https://github.com/ErnestoCobos/obsidian-wiki-sync

## Features

- Bidirectional synchronization between Obsidian and GitHub Wiki
- Automatic syncing on file save (optional)
- Periodic background syncing (configurable interval)
- Manual sync commands (sync, pull only, push only)
- Visual indicators of sync status
- Configurable local folder for wiki files

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to "Community Plugins" and disable Safe Mode
3. Click "Browse" and search for "GitHub Wiki Sync"
4. Install the plugin and enable it

### Manual Installation

1. Download the latest release (`main.js`, `manifest.json`, `styles.css`)
2. Create a folder named `github-wiki-sync` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into that folder
4. Restart Obsidian and enable the plugin in Settings > Community Plugins

## Configuration

Before using the plugin, you need to configure it in Settings:

1. **GitHub Token**: A personal access token with `repo` permissions. You can generate one from your [GitHub Developer Settings](https://github.com/settings/tokens).
2. **GitHub Username**: Your GitHub username.
3. **Repository Name**: The name of the repository that contains the wiki (without the `.wiki` part).
4. **Wiki Folder Path**: (Optional) The folder in your vault where wiki files will be stored. Leave empty to use the root of your vault.
5. **Sync on Save**: Toggle to enable automatic pushing to GitHub when files are saved.
6. **Auto Sync Interval**: Set how often (in minutes) the plugin should automatically sync with GitHub. Set to 0 to disable.

## Usage

Once configured, you can use the plugin in several ways:

### Manual Sync

- Click the refresh icon in the left ribbon to perform a full sync
- Use the command palette and search for "GitHub Wiki: Sync with GitHub Wiki"
- Use the "Sync Now" button in the plugin settings

### Pull Changes Only

To download changes from GitHub Wiki without pushing your local changes:

- Use the command palette and search for "GitHub Wiki: Pull from GitHub Wiki"

### Push Changes Only

To upload your local changes to GitHub Wiki without pulling first:

- Use the command palette and search for "GitHub Wiki: Push to GitHub Wiki"

### Automatic Sync

If you've enabled "Sync on Save" or set an auto-sync interval, the plugin will automatically synchronize according to your settings.

## File Name Handling

The plugin handles file naming conventions between Obsidian and GitHub Wiki:

- Obsidian file: `my-note.md`
- GitHub Wiki page: `my-note`

Special characters and spaces in filenames are preserved in both directions.

## Status Indicators

- The status bar shows the current sync status and last sync time
- A visual indicator appears during sync operations
- Notifications display success or error messages after sync operations

## Enhancing Documentation with External Tools

You can enhance your wiki documentation by integrating it with external tools:

### Using Context7 for Documentation Analysis

[Context7](https://context7.com) is a tool that can help analyze and enhance your documentation. By integrating with Context7, you can:

- Automatically analyze your wiki content for comprehensiveness
- Get suggestions for improving documentation clarity
- Track documentation coverage for your project
- Identify gaps in documentation

To use Context7 with this plugin:

1. Sync your Obsidian notes with GitHub Wiki using this plugin
2. Connect your GitHub repository to Context7
3. Use Context7's analytics to improve your documentation

### Using Perplexity for Research and Content Creation

[Perplexity](https://www.perplexity.ai) is an AI research assistant that can help with documentation creation. It can be used alongside this plugin to:

- Research technical topics to include in your documentation
- Answer questions about technologies your project uses
- Generate initial drafts of documentation
- Find relevant sources to cite in your wiki

Workflow with Perplexity:

1. Use Perplexity to research topics for your documentation
2. Create or edit notes in Obsidian based on research findings
3. Use this plugin to sync your improved documentation to GitHub Wiki
4. Keep documentation up-to-date by repeating this process

## Development

To build the plugin for development:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development build process
4. Copy the built files to your `.obsidian/plugins/github-wiki-sync/` directory

### Testing

This plugin includes a comprehensive test suite using Jest. The tests are organized into several categories:

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test how components work together
- **Component Tests**: Focus on specific plugin components like GitHub API
- **Performance Tests**: Measure sync efficiency with large repositories

#### Running Tests

You can run different test suites with these npm commands:

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only component tests
npm run test:components

# Run only performance tests
npm run test:performance

# Run end-to-end tests
npm run test:e2e

# Generate test coverage report
npm run test:coverage

# Generate test coverage report for CI
npm run test:coverage:ci

# Generate coverage report with badge
npm run coverage:report
```

Or use the included test script for better visual output:

```bash
# Run all tests sequentially with colorized output
./run-tests.sh

# Run a specific test suite
./run-tests.sh unit
./run-tests.sh integration
./run-tests.sh components
./run-tests.sh performance
./run-tests.sh e2e
./run-tests.sh coverage
./run-tests.sh coverage:ci
./run-tests.sh coverage:report
```

#### Test Coverage

The test suite aims for high coverage of core functionality:
- Plugin initialization and setup
- GitHub API integration
- Sync functionality (pull, push, and full sync)
- Error handling and edge cases
- Settings management
- Path conversion

##### Coverage Thresholds

We maintain strict coverage thresholds to ensure code quality:

| Metric | Global Threshold | main.ts Threshold |
|--------|-----------------|------------------|
| Lines | 80% | 85% |
| Statements | 80% | 85% |
| Functions | 75% | 85% |
| Branches | 70% | 80% |

These thresholds are enforced in CI builds and help maintain code quality. The coverage report is generated with every pull request and is available through:

- **Coverage Badge**: Shows overall line coverage percentage 
- **Codecov Integration**: Provides detailed coverage analysis with source code visualization
- **PR Comments**: Automated comments on pull requests with coverage changes

##### Running Coverage Locally

To check coverage on your local machine:

```bash
# Generate a full coverage report
npm run coverage:report

# Open the HTML report
open coverage/lcov-report/index.html

# Generate just the coverage badge
npm run coverage:badge
```

Coverage reports include:
- Line-by-line source code coverage visualization
- Function and branch coverage details
- Coverage trends over time (through Codecov)
- Uncovered code identification

#### Integration Testing

Integration tests verify that the plugin correctly:
- Syncs content between Obsidian and GitHub Wiki
- Handles conflicts correctly
- Performs efficient differential syncs (only changed files)
- Manages file paths between systems

#### Performance Testing

Performance tests ensure the plugin remains efficient with:
- Large repositories (100+ wiki pages)
- Frequent sync operations
- Different sync strategies

When contributing, please ensure that your changes are covered by appropriate tests.

## GitHub Actions

This project uses GitHub Actions to automate testing and releases:

### Continuous Integration

The `build-test.yml` workflow runs on every push to main and on every pull request:

- Builds the plugin with multiple Node.js versions
- Runs all tests to ensure code quality
- Uploads build artifacts for verification

### Automated Releases

The `release.yml` workflow is triggered when you push a new tag:

1. Builds and tests the plugin
2. Creates a GitHub release with the appropriate files
3. Attaches the built files as release assets

### Creating a New Release

To create a new release:

```bash
# Update version in package.json and manifest.json
npm version patch  # or minor, or major

# Push changes including the new tag
git push --follow-tags
```

The GitHub Actions workflow will automatically create a new release with the built files.

## Contributing

Contributions are welcome! Please check out our [contribution guidelines](CONTRIBUTING.md) to get started.

We welcome contributions in different areas:

- Code improvements and bug fixes
- Documentation enhancements
- Translations
- Test coverage

If you're interested in contributing code, please ensure your code has appropriate test coverage.

## License

MIT License

## Acknowledgements

This plugin was inspired by the need to collaborate on documentation between Obsidian users and GitHub contributors.

## Support

If you encounter any issues or have feature requests, please open an issue on the GitHub repository.
