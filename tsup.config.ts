import { replace } from 'esbuild-plugin-replace'
import { defineConfig, type Options } from 'tsup'
import { bundleless } from 'tsup-plugin-bundleless'

const { plugins, esbuildPlugins } = bundleless()

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
  plugins,
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
      ...esbuildPlugins,
    ],
    outDir: 'dist/lib',
    outExtension: () => ({ js: '.js', dts: '.d.ts' }), // TODO: custom dts extension not working
  },
  // esm
  {
    ...tsupConfig(option),
    format: 'esm',
    esbuildPlugins: [
      replace({
        'import.meta.env?.MODE': '(import.meta.env ? import.meta.env.MODE : undefined)',
      }),
      ...esbuildPlugins,
    ],
    outDir: 'dist/esm',
    outExtension: () => ({ js: '.mjs' }),
  },
  // cjs
  {
    ...tsupConfig(option),
    format: 'cjs',
    esbuildPlugins: [
      replace({
        'import.meta.env?.MODE': 'process.env.NODE_ENV',
      }),
      ...esbuildPlugins,
    ],
  },
])
