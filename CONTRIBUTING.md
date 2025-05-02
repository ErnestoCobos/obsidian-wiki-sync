# Contributing to GitHub Wiki Sync

Thank you for considering contributing to the GitHub Wiki Sync plugin for Obsidian! This document provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/obsidian-github-wiki-sync.git
   cd obsidian-github-wiki-sync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Link the plugin to your Obsidian vault for testing:
   - Create a folder in your vault's `.obsidian/plugins` directory named `github-wiki-sync`
   - Copy or symlink the `main.js`, `manifest.json`, and `styles.css` files to this folder
   - Enable the plugin in Obsidian's Community Plugins settings

## Testing

Run different test suites using the provided npm scripts:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run component-specific tests
npm run test:components

# Run performance tests
npm run test:performance

# Generate coverage report
npm run test:coverage
```

Alternatively, use the `run-tests.sh` script for colorized output:

```bash
./run-tests.sh unit
```

## Code Style and Standards

- Follow TypeScript best practices
- Use meaningful variable and function names
- Keep functions small and focused
- Comment complex logic
- Write tests for new functionality

## Pull Request Process

1. Create a new branch for your feature or bugfix
2. Make your changes with appropriate tests
3. Run the tests to ensure everything passes
4. Update documentation if necessary
5. Submit a pull request with a clear description of the changes
6. Wait for review and address any feedback

## Releasing

Releases are handled via GitHub Actions when a new tag is pushed:

```bash
# Update version numbers
npm version patch  # or minor or major

# Push with tags
git push --follow-tags
```

## Code of Conduct

- Be respectful and inclusive in all interactions
- Value different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community and users
- Show empathy towards other community members

## Questions?

If you have questions about contributing, please open an issue or contact the maintainers directly.

Thank you for contributing to make GitHub Wiki Sync better for everyone!