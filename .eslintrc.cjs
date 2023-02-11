module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['file-progress', 'sonarjs', 'no-null', 'deprecation', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:sonarjs/recommended',
    'next/core-web-vitals',
    'plugin:prettier/recommended',
  ],
  globals: {
    globalThis: 'readonly',
  },
  rules: {
    'file-progress/activate': 1,
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
    'sonarjs/prefer-immediate-return': 'off',
    'sonarjs/cognitive-complexity': 'error',
    'no-null/no-null': 'error',
    'import/no-duplicates': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // side effect imports
          ['^\\u0000'],
          // core imports
          ['^node:'],
          // external imports
          ['^'],
          // internal imports
          ['^pkg-'],
          // relative imports (should convert them to internal imports except for scripts)
          ['^\\.'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'react/display-name': 'off',
  },
  overrides: [
    {
      files: ['*.js', '*.cjs'],
      parserOptions: {
        // eslint-disable-next-line no-null/no-null
        project: null,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'deprecation/deprecation': 'warn',
      },
    },
    {
      files: ['*.spec.ts'],
      rules: {
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'max-lines-per-function': 'off',
      },
    },
  ],
}
