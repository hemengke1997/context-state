/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    onConsoleLog(log) {
      if (log.includes('Generated an empty chunk')) {
        return false
      }
      return undefined
    },
    globals: true,
    environment: 'jsdom',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
})
