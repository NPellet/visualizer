import { defineConfig, globalIgnores } from 'eslint/config';
import cheminfo from 'eslint-config-cheminfo/base';
import globals from 'globals';

export default defineConfig(
  globalIgnores([
    'src/components',
    'src/lib/*',
    '!src/lib/gcms',
    'src/browserified',
    'src/modules/types/legacy',
    'src/modules/types/science/chemistry/jsmol/lib',
    'src/modules/types/science/chemistry/jsme/lib',
    'src/modules/types/edition/slick_grid/slick.*',
    'src/modules/types/chart/advanced/plot_function/TrackballControls.js',
    'src/modules/types/science/chemistry/jsme/jquery.min.js',
    'src/src/util/workers',
  ]),
  cheminfo,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      sourceType: 'script',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.amd,
        ...globals.jquery,
        setImmediate: false,
        DataArray: false,
        DataBoolean: false,
        DataNumber: false,
        DataObject: false,
        DataString: false,
      },
    },
    rules: {
      'import/no-dynamic-require': 'off',
      'array-callback-return': 'off',
      'block-scoped-var': 'off',
      camelcase: 'off',
      'default-case': 'off',
      eqeqeq: 'off',
      'func-names': 'off',
      'new-cap': 'off',
      'no-await-in-loop': 'off',
      'no-empty-function': 'off',
      'no-eval': 'off',
      'no-invalid-this': 'off',
      'no-unused-vars': 'off',
      'no-var': 'off',
      'object-shorthand': 'off',
      'one-var': 'off',
      'prefer-named-capture-group': 'off',
      'prefer-object-spread': 'off',
      'prefer-rest-params': 'off',
      'prefer-spread': 'off',
    },
  },
);
