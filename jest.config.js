module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  // Use testMatch instead of testRegex for more control
  testMatch: [
    "<rootDir>/tests/**/*.test.ts"
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'main.ts',
    'src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!esbuild.config.mjs',
    '!version-bump.mjs',
    '!jest.config.js'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
    'cobertura'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    },
    'main.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  moduleNameMapper: {
    // Handle obsidian module mocks
    'obsidian': '<rootDir>/tests/__mocks__/obsidian.ts'
  },
  // Configure custom reporters
  reporters: [
    "default",
    ["jest-junit", {
      outputDirectory: "./coverage",
      outputName: "junit.xml"
    }]
  ],
  // Setup test timeouts for performance tests
  testTimeout: 15000,
  // Setup test result caching for faster reruns
  cache: true,
  cacheDirectory: ".jest-cache",
  // Setup verbose output for debugging
  verbose: true,
  // Setup tests to run in serial in CI environment
  ...(process.env.CI && {
    maxWorkers: 2
  })
};