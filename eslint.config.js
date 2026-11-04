import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const firebaseBan = { group: ['firebase/*'], message: 'Only src/services may talk to Firebase.' };
const servicesBan = {
  group: ['@/services/*', '@/services'],
  message: 'Components dispatch thunks; they never call services directly.',
};

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strict, prettier],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      // Redux Toolkit's documented way to declare a thunk that takes no argument is `_: void`.
      '@typescript-eslint/no-invalid-void-type': 'off',
      'no-restricted-imports': ['error', { patterns: [firebaseBan] }],
    },
  },
  {
    files: ['src/components/**/*.tsx', 'src/features/**/*.tsx', 'src/pages/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [firebaseBan, servicesBan] }],
    },
  },
  {
    files: ['src/services/**/*.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
);
