export default [
  {
    input: 'node_modules/openchemlib/dist/openchemlib.js',
    output: {
      file: 'src/browserified/openchemlib.js',
      format: 'amd',
      exports: 'named',
    },
  },
];
