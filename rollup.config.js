import { terser } from "rollup-plugin-terser";
import filesize from 'rollup-plugin-filesize';

const INPUTS = [
  'test-element'
];

export default INPUTS.map((input) => {
  return {
    input: `./bin/${input}.js`,
    output: {
      file: `./packages/${input}/${input}.js`,
      format: 'esm'
    },
    plugins: [
      terser(),
      filesize({
        showMinifiedSize: false,
        showBeforeSizes: 'build'
      })
    ]
  }
});