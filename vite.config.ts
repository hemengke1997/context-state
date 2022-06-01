import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import typescript from '@rollup/plugin-typescript';
// import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

const env = process.env.NODE_ENV;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      include: ['src/index.ts', 'src/utils/useMemoizedFn.ts', 'src/utils/shallowEqual.ts'],
    }),
    commonjs(),
    // replace({ 'process.env.NODE_ENV': JSON.stringify(env), preventAssignment: true }),
  ],
  define: mode === 'production' && {
    'process.env.NODE_ENV': 'process.env.NODE_ENV',
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
          'react-dom': 'ReactDom',
        },
      },
    },
  },
}));
