/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
module.exports = [
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Prevent console.log in production code
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Enforce explicit return types on exported functions
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // No unused variables
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
