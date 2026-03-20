module.exports = {
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      excludedFiles: ['*.native.*', '*.ios.*', '*.android.*'],
      rules: {
        'no-restricted-imports': 'error',
      },
    },
  ],
}
