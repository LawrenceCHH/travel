import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'src/posts/**', 'template_posts/**', '.agents/**'] },
  js.configs.recommended,
  {
    files: ['assets/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser }
    }
  },
  {
    files: ['public/sw.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.serviceworker }
    }
  },
  {
    files: ['scripts/**/*.js', 'scripts/**/*.mjs', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node }
    }
  },
  eslintConfigPrettier
];
