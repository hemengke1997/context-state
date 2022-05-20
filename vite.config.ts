import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import typescript from '@rollup/plugin-typescript';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      include: ['src/index.ts', 'src/utils/useMemoizedFn.ts', 'src/utils/shallowEqual.ts'],
    }),
  ],
  esbuild: {
    pure: ['console.log'],
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'context-state',
      fileName: 'index',
      formats: ['es', 'umd'],
    },
    target: 'es6',
    minify: 'esbuild',
    // watch: {},
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'React-dom',
        },
      },
    },
  },
});
