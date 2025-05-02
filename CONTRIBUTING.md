# Contributing to GitHub Wiki Sync

Thank you for considering contributing to the GitHub Wiki Sync plugin for Obsidian! This document will guide you through the contribution process.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ErnestoCobos/obsidian-wiki-sync.git
   cd obsidian-wiki-sync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development environment:
   ```bash
   npm run dev
   ```

4. Link the plugin to your Obsidian vault for testing:
   - Create a folder in your vault's `.obsidian/plugins` directory named `github-wiki-sync`
   - Copy or symlink the `main.js`, `manifest.json`, and `styles.css` files to this folder
   - Enable the plugin in Obsidian's Community Plugins settings

## Code Style and Quality

We use several tools to ensure code quality and consistency:

- **TypeScript**: Strongly typed code helps catch errors early
- **ESLint**: For static code analysis
- **Prettier**: For consistent code formatting
- **Jest**: For unit, integration, and e2e testing

Before submitting any code, please ensure:

1. All linting passes:
   ```bash
   npm run lint
   ```

2. Code is properly formatted:
   ```bash
   npm run format
   ```

3. All tests pass:
   ```bash
   npm run test:all
   ```

4. Test coverage remains high:
   ```bash
   npm run coverage:report
   ```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This enables automatic versioning and changelog generation.

Examples of good commit messages:
- `feat: add GitHub wiki page templates support`
- `fix: resolve synchronization conflict with spaces in filenames`
- `docs: improve setup instructions`
- `test: add tests for path conversion utilities`
- `chore: update dependencies`

## Pull Requests

1. Create a branch with a descriptive name:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Make your changes, following our code style guidelines

3. Push your branch and create a pull request

4. In your PR description, please include:
   - A clear explanation of what the changes do
   - Any relevant screenshots or code examples
   - References to issues that this PR resolves

## Testing

The plugin includes several types of tests:

- **Unit Tests**: Test individual components
  ```bash
  npm run test:unit
  ```

- **Integration Tests**: Test how components work together
  ```bash
  npm run test:integration
  ```

- **Component Tests**: Focus on specific components
  ```bash
  npm run test:components
  ```

- **E2E Tests**: Test entire workflows
  ```bash
  npm run test:e2e
  ```

- **Performance Tests**: Ensure good performance
  ```bash
  npm run test:performance
  ```

Please add appropriate tests for any new functionality you introduce.

## CI/CD Pipeline

When you submit a PR, our GitHub Actions workflows will automatically:

1. Lint and format your code
2. Run all tests
3. Generate coverage reports
4. Check bundle size
5. Build the plugin

Please ensure all these checks pass before requesting a review.

## Releasing

Releases are handled automatically through semantic-release. When commits are merged to the main branch:

1. The version is automatically determined from commit messages
2. Changelog is updated
3. Tags are created
4. GitHub release is published

## Code of Conduct

- Be respectful and inclusive in all interactions
- Value different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community and users
- Show empathy towards other community members

## Questions?

If you have questions about contributing, please open an issue on GitHub or reach out to the maintainers directly.

Thank you for your contributions!