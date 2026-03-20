module.exports = {
  root: true,
  extends: ['@cotp/eslint-config/native', '@cotp/eslint-config/crossPlatform'],
  ignorePatterns: ['node_modules', '.turbo', '.eslintrc.js'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['src/index.ts', 'src/state/index.ts', 'src/test/**'],
      rules: {
        'check-file/no-index': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-relative-import-paths/no-relative-import-paths': [
          'error',
          {
            allowSameFolder: false,
            prefix: 'cotp',
          },
        ],
      },
    },
  ],
  rules: {},
}
