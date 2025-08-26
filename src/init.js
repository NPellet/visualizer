'use strict';

require.config({
  waitSeconds: 0,
  paths: {
    ace: 'components/ace/src',
    angularplasmid:
      'node_modules/angularplasmid/dist/angularplasmid.complete.min',
    canvg: 'components/canvg/dist/canvg.bundle',
    chroma: 'components/chroma-js/chroma.min',
    ckeditor: 'components/ckeditor/ckeditor',
    countryData: 'browserified/country-data/index',
    delay: 'browserified/delay/index',
    d3: 'components/d3/d3.min',
    eventEmitter: 'components/eventEmitter/EventEmitter.min',
    'file-saver': 'components/file-saver.js/FileSaver',
    forms: 'lib/forms',
    highlightjs: 'lib/highlight.js/highlight.pack',
    jcampconverter: 'lib/jcampconverter/jcampconverter.7.3.1.min',
    jqgrid: 'components/jqgrid_edit/js/jquery.jqGrid',
    jsbarcode: 'node_modules/jsbarcode/dist/JsBarcode.all.min',
    jquery: 'node_modules/jquery/dist/jquery',
    'jquery-migrate': 'node_modules/jquery-migrate/dist/jquery-migrate',
    'jquery-tmpl': 'components/jquery-tmpl/jquery.tmpl.min',
    'jquery-ui': 'node_modules/jquery-ui/dist/jquery-ui',
    jsgraph: 'components/jsgraph/dist/jsgraph-es6',
    'json-chart': 'components/json-chart/dist/json-chart.min',
    jszip: 'components/jszip/dist/jszip.min',
    'js-yaml': 'components/js-yaml/dist/js-yaml.min',
    katex: 'node_modules/katex/dist/katex.min',
    lodash: 'components/lodash/dist/lodash.min',
    loglevel: 'components/loglevel/dist/loglevel',
    'markdown-js': 'components/markdown-js/lib/markdown',
    marked: 'components/marked/lib/marked',
    // mathjax:            'components/MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML&amp;delayStartupUntil=configured',
    mathjs: 'node_modules/mathjs/lib/browser/math',
    'mime-types': 'browserified/mime-types/index',
    moment: 'components/moment/moment',
    'moment-duration-format':
      'components/moment-duration-format/lib/moment-duration-format',
    notifyjs: 'components/notifyjs/dist/notify',
    msa: 'lib/msa/msa.min',
    'nmr-simulation': 'components/nmr-simulation/dist/nmr-simulation',
    numeral: 'components/numeral/numeral',
    openchemlib: 'browserified/openchemlib/openchemlib',
    papaparse: 'components/papa-parse/papaparse.min',
    plot: 'lib/plot/plot',
    pouchdb: 'components/pouchdb/dist/pouchdb.min',
    quillPrivate: 'src/quillPrivate',
    quill: 'node_modules/quill/dist/quill',
    quillResizeModule: 'node_modules/quill-resize-module/dist/resize',
    quillTableBetterModule:
      'node_modules/quill-table-better/dist/quill-table-better',
    RxnRenderer: 'browserified/RxnRenderer/index',
    MFParser: 'browserified/MFParser/index',
    select2: 'components/select2/dist/js/select2.full',
    slickgrid: 'components/slickgrid/slick.grid',
    slickgrid_core: 'components/slickgrid/slick.core',
    'smart-array-filter': 'browserified/SmartArrayFilter/index',
    sparkline: 'lib/jquery.sparkline/jquery.sparkline.min',
    sprintf: 'components/sprintf/dist/sprintf.min',
    superagent: 'browserified/superagent/index',
    threejs: 'components/threejs/build/three.min',
    uri: 'components/uri.js/src',
    'web-animations': 'components/web-animations-js/web-animations.min',
    x2js: 'components/x2js/xml2json.min',
  },
  shim: {
    canvg: {
      exports: 'canvg',
    },
    katex: {
      exports: 'katex',
    },
    // mathjax: {
    // exports: 'MathJax',
    // init: function () {
    //  MathJax.Hub.Config({ /* Your configuration here */ });
    //  MathJax.Hub.Startup.onload();
    //  return MathJax;
    // }
    // },
    threejs: {
      exports: 'THREE',
      init() {
        // Allow cross-origin images
        this.THREE.ImageUtils.crossOrigin = 'anonymous';
      },
    },
    msa: {
      exports: 'msa',
    },
    x2js: {
      exports: 'X2JS',
    },
    'components/jit/Jit/jit': {
      exports: '$jit',
    },
    ckeditor: {
      exports: 'CKEDITOR',
    },
    'lib/parser/Parser': {
      exports: 'Parser',
    },
    quillResizeModule: ['quillPrivate', 'quill'],
    quillTableBetterModule: ['quillPrivate', 'quill'],
    select2: ['jquery'],
    jsbarcode: ['jquery'],
    'lib/threejs/TrackballControls': ['threejs'],
    'jquery-migrate': ['jquery'],
    'jquery-ui': ['jquery'],
    jqgrid: ['jquery', 'components/jqgrid_edit/js/i18n/grid.locale-en'],
    'lib/couchdb/jquery.couch': ['jquery'],
    slickgrid_core: ['jquery', 'jquery-ui', 'jquery-tmpl'],
    slickgrid: {
      deps: [
        'slickgrid_core',
        'components/slickgrid/slick.groupitemmetadataprovider',
        'components/slickgrid/slick.groupitemmetadataprovider',
        'components/slickgrid/slick.dataview',
        'components/slickgrid/lib/jquery.event.drop-2.2',
        'components/slickgrid/lib/jquery.event.drag-2.2',
        'components/slickgrid/plugins/slick.cellrangedecorator',
        'components/slickgrid/plugins/slick.cellrangeselector',
        'components/slickgrid/plugins/slick.cellselectionmodel',
        'components/slickgrid/plugins/slick.rowselectionmodel',
        'components/slickgrid/plugins/slick.rowmovemanager',
        'components/slickgrid/plugins/slick.cellexternalcopymanager',
        'components/slickgrid/slick.editors',
        'modules/types/edition/slick_grid/slickCustomEditors',
        'modules/types/edition/slick_grid/slickCustomFormatters',
        'components/slickgrid/plugins/slick.checkboxselectcolumn',
        'components/slickgrid/controls/slick.columnpicker',
        'components/slickgrid/examples/slick.compositeeditor',
      ],
      exports: 'Slick',
    },
    'libs/jsmol/js/JSmolApplet': ['libs/jsmol/JSmol.min.nojq'],
    'lib/flot/jquery.flot.pie': ['jquery', 'lib/flot/jquery.flot'],
    'lib/pixastic/pixastic': {
      deps: ['lib/pixastic/pixastic/pixastic.core'],
      exports: 'Pixastic',
    },
    'moment-duration-format': ['moment'],
  },
  map: {
    '*': {
      quill: 'quillPrivate',
      Quill: 'quillPrivate',
      'components/fancytree/dist/modules/jquery.fancytree.ui-deps': 'jquery-ui',
    },
    quillPrivate: {
      quill: 'quill',
    },
  },
});

define('esm', {
  load(url, req, onload) {
    const urlString = JSON.stringify(url);
    const importPromise = eval(`import(${urlString})`);
    importPromise.then(
      function (mod) {
        onload(mod);
      },
      function (error) {
        onload.error(error);
      },
    );
  },
});

window.CKEDITOR_BASEPATH = require.toUrl('components/ckeditor/');

require([
  'version',
  'jquery',
  'src/main/datas',
  'src/main/entrypoint',
  'uri/URI.fragmentQuery',
  'components/setImmediate/setImmediate',
  'lib/regenerator/regenerator-runtime',
  'jquery-ui',
  // Uncomment to enable jquery-migrate deprecations warnings.
  // 'jquery-migrate',
], function (Version, $, Datas, EntryPoint, URI) {
  $(document).ready(() => {
    const url = new URI(window.location.href);
    const type =
      url.search().length > 0
        ? 'search'
        : url.fragment()[0] === '?'
          ? 'fragment'
          : 'search';
    const query = new URI(url[type]()).query(true);
    EntryPoint.init(query, type.replace(type[0], type[0].toUpperCase()));
  });
});
