import {nodeResolve} from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-import-css';

const INPUTS = [
  'regex-element'
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
      css(),
    ],
    context: 'window'
    // external: [
    //   '/node_modules/'
    // ]
  }
});