import { replace } from 'esbuild-plugin-replace'
import fs from 'node:fs'
import path from 'node:path'
import { type Options, defineConfig } from 'tsup'

// To aviod nodejs error: ERR_UNSUPPORTED_DIR_IMPORT
const fileSuffixPlugin = (suffix: '.js' | '.cjs' | '.mjs'): NonNullable<Options['esbuildPlugins']>[number] => ({
  name: 'add-file-suffix',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (args.kind === 'entry-point') return
      let importeePath = args.path

      // is external module
      if (importeePath[0] !== '.' && !path.isAbsolute(importeePath)) {
        return { external: true }
      }

      if (!path.extname(importeePath) && !importeePath.endsWith('.js')) {
        // is path dir?
        const filePath = path.join(args.resolveDir, importeePath)

        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          importeePath += `/index${suffix}`
        } else {
          importeePath += suffix
        }
        return { path: importeePath, external: true }
      }
      return {
        path: importeePath,
        external: true,
      }
    })
  },
})

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
  // esm
  {
    ...tsupConfig(option),
    format: ['esm'],
    esbuildPlugins: [
      replace({
        'import.meta.env?.MODE': 'process.env.NODE_ENV',
      }),
      fileSuffixPlugin('.js'),
    ],
    outExtension: () => {
      return {
        js: '.js',
      }
    },
    outDir: 'dist/esm',
    dts: false,
  },
  {
    ...tsupConfig(option),
    format: ['esm'],
    outExtension: () => {
      return {
        js: '.mjs',
      }
    },
    esbuildPlugins: [
      replace({
        'import.meta.env?.MODE': '(import.meta.env ? import.meta.env.MODE : undefined)',
      }),
      fileSuffixPlugin('.mjs'),
    ],
    outDir: 'dist/esm',
  },
  // cjs
  {
    ...tsupConfig(option),
    format: ['cjs'],
    esbuildPlugins: [
      replace({
        'import.meta.env?.MODE': 'process.env.NODE_ENV',
      }),
      fileSuffixPlugin('.js'),
    ],
  },
])
