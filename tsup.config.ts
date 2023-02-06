import { defineConfig } from 'tsup'

console.log(JSON.stringify(process.env.NODE_ENV))

export const tsup = defineConfig((option) => ({
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
  minify: false,
  sourcemap: !!option.watch,
  external: ['react', 'react-dom'],
  define: {
    'process.env.NODE_ENV': 'process.env.NODE_ENV',
  },
  pure: ['console.log'],
}))