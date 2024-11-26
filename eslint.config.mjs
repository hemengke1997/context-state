import { defineConfig } from '@minko-fe/eslint-config'

export default defineConfig([
  {
    files: ['**/*.md/**/*.{tsx,jsx}'],
    rules: {
      'react/jsx-no-undef': 'off',
    },
  },
])
