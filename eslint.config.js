import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,mjs,jsx}'],
    extends: [
      js.configs.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { react },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Counts identifiers referenced in JSX (including members such as
      // `motion.div`) as used. Without it `no-unused-vars` reports every
      // imported component as unused.
      'react/jsx-uses-vars': 'error',
    },
  },
  {
    // Server-side code: the API routes and the Vite config run under Node.
    files: ['server/**/*.js', 'netlify/**/*.mjs', 'vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
