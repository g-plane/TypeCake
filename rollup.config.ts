import { defineConfig } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import swc from 'rollup-plugin-swc'

export default defineConfig({
  input: './src/index.ts',
  output: {
    file: './dist/typecake.mjs',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    resolve({
      extensions: ['.ts'],
    }),
    swc(),
  ],
  external: ['acorn'],
})
