import { replace } from 'esbuild-plugin-replace'
import { type Options, defineConfig } from 'tsup'
import { bundleless } from 'tsup-plugin-bundleless'

const tsupConfig = (option: Options): Options => ({
  entry: ['src/**/*.ts'],
  dts: true,
  clean: !option.watch,
  splitting: false,
  treeshake: true,
  minify: false,
  sourcemap: !!option.watch,
  external: ['react'],
  pure: option.watch ? [] : ['console.log'],
  platform: 'browser',
  target: 'es3',
})

export const tsup = defineConfig((option) => [
  // lib
  {
    ...tsupConfig(option),
    format: 'esm',
    esbuildPlugins: [
      replace({
        'import.meta.env?.MODE': 'process.env.NODE_ENV',
      }),
    ],
    outDir: 'dist/lib',
    outExtension: () => ({ js: '.js', dts: '.d.ts' }), // TODO: custom dts extension not working
    plugins: [bundleless({ ext: '.js' })],
  },
  // esm
  {
    ...tsupConfig(option),
    format: 'esm',
    esbuildPlugins: [
      replace({
        'import.meta.env?.MODE': '(import.meta.env ? import.meta.env.MODE : undefined)',
      }),
    ],
    outDir: 'dist/esm',
    outExtension: () => ({ js: '.mjs' }),
    plugins: [bundleless({ ext: '.mjs' })],
  },
  // cjs
  {
    ...tsupConfig(option),
    format: 'cjs',
    esbuildPlugins: [
      replace({
        'import.meta.env?.MODE': 'process.env.NODE_ENV',
      }),
    ],
    plugins: [bundleless({ ext: '.js' })],
  },
])
