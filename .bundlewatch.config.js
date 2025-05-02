module.exports = {
  files: [
    {
      path: 'main.js',
      maxSize: '100kB',
      compression: 'gzip'
    },
    {
      path: 'styles.css',
      maxSize: '10kB',
      compression: 'gzip'
    }
  ],
  ci: {
    trackBranches: ['master', 'main'],
    ciEnv: {
      githubAccessToken: process.env.GITHUB_TOKEN
    }
  }
};