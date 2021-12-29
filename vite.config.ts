import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import typescript2 from 'rollup-plugin-typescript2';
const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      ...typescript2({
        check: false,
        tsconfig: path.resolve(__dirname, `tsconfig.json`),
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: false,
            declaration: true,
            declarationMap: false,
          },
          include: [
            "src/index.tsx"
          ]
        },
      }),
      enforce: 'pre',
      apply: 'build',
    },
  ],
  build: {
    outDir: 'dist',
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'context-state',
      fileName: 'index',
      formats: ['es', 'umd'],
    },
    terserOptions: {
      compress: {
        keep_infinity: true,
        // Used to delete console in production environment
        drop_console: true,
      },
    },

    // watch: {},
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'react',
          'react-dom': 'react-dom',
        },
      },
    },
  },
});
