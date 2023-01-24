import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-import-css';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import {createRequire} from 'node:module';
import externals from 'rollup-plugin-node-externals'; // comment out when packing dependencies for local testing
import {nodeResolve} from '@rollup/plugin-node-resolve';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const INPUTS = [
  'micro-parsons'
];


export default INPUTS.map((input) => {
  return {
    input: `./bin/${input}.js`,
    output: {
      file: `./${input}/${input}.js`,
      format: 'esm',
      sourcemap: true,
      esModule: true,
      interop: 'auto',
    },
    plugins: [
      terser(),
      // filesize({
      //   showMinifiedSize: false,
      //   showBeforeSizes: 'build'
      // }),
      typescript(),
      // nodePolyfills(),
      commonjs(),
      css(),
      json(),
      externals({ // comment out when packing dependencies for local testing
        include:'highlight.js/lib/languages/sql'
      }),
      nodeResolve()
    ],
    context: 'window',
    external: [  // comment out when packing dependencies for local testing
      '/node_modules/'
    ]
  }
});