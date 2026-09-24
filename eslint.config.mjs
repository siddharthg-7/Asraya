export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/out/**',
      '**/*.tsbuildinfo',
      'circuits/build/**',
      'coverage/**',
    ],
  },
  {
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
];
