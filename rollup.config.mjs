import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const plugins = [commonjs({}), json(), nodeResolve({ browser: true })];

export default [
  {
    input: 'node_modules/country-data/index.js',
    output: {
      file: 'src/browserified/country-data/index.js',
      format: 'umd',
      name: 'CountryData',
    },
    plugins,
  },
  {
    input: 'node_modules/delay/index.js',
    output: {
      file: 'src/browserified/delay/index.js',
      format: 'umd',
      name: 'Delay',
    },
    plugins,
  },
  {
    input: 'node_modules/openchemlib/dist/openchemlib.js',
    output: {
      file: 'src/browserified/openchemlib/openchemlib.js',
      format: 'amd',
      exports: 'named',
    },
  },
  {
    input: 'node_modules/smart-array-filter/lib/index.js',
    output: {
      file: 'src/browserified/SmartArrayFilter/index.js',
      format: 'umd',
      name: 'SAF',
    },
    plugins,
  },
];
