import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';

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
    input: 'node_modules/mf-parser/lib/src/index.js',
    output: {
      file: 'src/browserified/MFParser/index.js',
      format: 'umd',
      name: 'MFParser',
    },
    plugins,
  },
  {
    input: 'node_modules/mime-types/index.js',
    output: {
      file: 'src/browserified/mime-types/index.js',
      format: 'umd',
      name: 'mimeTypes',
    },
    plugins: [...plugins, nodePolyfills()],
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
    input: 'node_modules/rxn-renderer/lib/index.js',
    output: {
      file: 'src/browserified/RxnRenderer/index.js',
      format: 'umd',
      name: 'RxnRenderer',
    },
    plugins,
  },
  {
    input: 'node_modules/semver/index.js',
    output: {
      file: 'src/browserified/semver/semver.js',
      format: 'umd',
      name: 'semver',
    },
    plugins,
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
  {
    input: 'node_modules/superagent/lib/client.js',
    output: {
      file: 'src/browserified/superagent/index.js',
      format: 'umd',
      name: 'superagent',
    },
    plugins,
  },
  {
    input: 'node_modules/twig/twig.min.js',
    output: {
      file: 'src/browserified/twig/twig.js',
      format: 'umd',
      name: 'Twig',
    },
    plugins,
  },
];
