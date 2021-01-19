import { terser } from "rollup-plugin-terser";
import filesize from 'rollup-plugin-filesize';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import commonjs from '@rollup/plugin-commonjs';

const INPUTS = [
  'test-element'
];

export default INPUTS.map((input) => {
  return {
    input: `./bin/${input}.js`,
    output: {
      file: `./packages/${input}/${input}.js`,
      format: 'esm',
      sourcemap: true,
      esModule: true,
      interop: 'auto',
    },
    plugins: [
      // terser(),
      // filesize({
      //   showMinifiedSize: false,
      //   showBeforeSizes: 'build'
      // }),
      typescript(),
      nodeResolve(),
      // nodePolyfills(),
      commonjs(),
    ],
    context: 'window'
    // external: [
    //   '/node_modules/'
    // ]
  }
});