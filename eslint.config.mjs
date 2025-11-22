import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  // Ignores
  {
    ignores: ['.next/', 'node_modules/', 'out/', 'public/', '.husky/'],
  },

  // Base JavaScript recommended
  js.configs.recommended,

  // TypeScript configuration
  ...tseslint.configs.recommended,

  // React and Next.js configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // Custom rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
