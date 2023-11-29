import { defineConfig } from 'tsup'

export const tsup = defineConfig((option) => ({
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  format: ['esm', 'cjs'],
  minify: !option.watch && 'terser',
  sourcemap: !!option.watch,
  external: ['react', 'react-dom'],
  define: {
    'process.env.NODE_ENV': 'process.env.NODE_ENV',
  },
  pure: option.watch ? [] : ['console.log'],
}))
