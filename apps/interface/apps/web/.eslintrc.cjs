/* eslint-env node */

require('@cotp/eslint-config/load')

const rulesDirPlugin = require('eslint-plugin-rulesdir')
rulesDirPlugin.RULES_DIR = 'eslint_rules'

module.exports = {
  root: true,
  extends: ['@cotp/eslint-config/react'],
  plugins: ['rulesdir'],

  rules: {
    // let prettier do things:
    semi: 0,
    quotes: 0,
    'comma-dangle': 0,
    'no-trailing-spaces': 0,
    'no-extra-semi': 0,
  },

  overrides: [
    {
      files: ['src/index.tsx', 'src/state/index.ts', 'src/components/**', 'src/theme/**', 'src/pages/**'],
      rules: {
        'check-file/no-index': 'off',
      },
    },
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      rules: {
        'no-relative-import-paths/no-relative-import-paths': [
          'error',
          {
            allowSameFolder: false,
            rootDir: 'src',
          },
        ],
      },
    },
    {
      files: ['**/*'],
      rules: {
        'multiline-comment-style': ['error', 'separate-lines'],
        'rulesdir/no-undefined-or': 'error',
      },
    },
    {
      // Configuration/typings typically export objects/definitions that are used outside of the transpiled package
      // (eg not captured by the tsconfig). Because it's typical and not exceptional, this is turned off entirely.
      files: ['**/*.config.*', '**/*.d.ts'],
      rules: {
        'import/no-unused-modules': 'off',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'react-helmet-async',
                // default package's esm export is broken, but the explicit cjs export works.
                message: `Import from 'react-helment-async/lib/index' instead.`,
              },
              {
                name: 'utilities/src/platform',
                importNames: ['isIOS', 'isAndroid'],
                message:
                  'Importing isIOS and isAndroid from platform is not allowed. Use isWebIOS and isWebAndroid instead.',
              },
            ],
          },
        ],
        'import/no-restricted-paths': [
          'error',
          {
            zones: [
              {
                target: ['src/**/*[!.test].ts', 'src/**/*[!.test].tsx'],
                from: 'src/test-utils',
              },
            ],
          },
        ],
        'no-restricted-syntax': [
          'error',
          {
            selector: ':matches(ExportAllDeclaration)',
            message: 'Barrel exports bloat the bundle size by preventing tree-shaking.',
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      excludedFiles: ['*.native.*', '*.ios.*', '*.android.*'],
      rules: {
        'no-restricted-imports': 'error',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      excludedFiles: ['src/analytics/*'],
      rules: {},
    },
  ],
}
