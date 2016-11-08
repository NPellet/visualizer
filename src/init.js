'use strict';

(function () {
    var iereg = /MSIE (\d+)/;
    var isIE = iereg.exec(navigator.userAgent);
    if (isIE) {
        var ieversion = parseInt(isIE[1]);
        if (ieversion <= 8) {
            alert('This application does not support IE' + ieversion + '.\nPlease upgrade your system to have IE11+ or use an alternate browser (Google Chrome, Firefox).');
            throw new Error('IE' + ieversion + ' not supported');
        }
    }
})();

require.config({
    waitSeconds: 0,
    paths: {
        ace: 'components/ace/src',
        async: 'components/async/dist/async',
        babel: 'components/babel-standalone/babel',
        bluebird: 'components/bluebird/js/browser/bluebird.core',
        bowser: 'components/bowser/bowser',
        chroma: 'components/chroma-js/chroma.min',
        ckeditor: 'components/ckeditor/ckeditor',
        countryData: 'browserified/country-data/index',
        d3: 'components/d3/d3.min',
        eventEmitter: 'components/eventEmitter/EventEmitter.min',
        fancytree: 'components/fancytree/dist/jquery.fancytree-all',
        fetch: 'components/fetch/fetch',
        'file-saver': 'components/file-saver.js/FileSaver',
        forms: 'lib/forms',
        highlightjs: 'lib/highlight.js/highlight.pack',
        jcampconverter: 'components/jcampconverter/dist/jcampconverter.min',
        jqgrid: 'components/jqgrid_edit/js/jquery.jqGrid',
        jsbarcode: 'components/jsbarcode/JsBarcode',
        jquery: 'components/jquery/dist/jquery',
        'jquery-cookie': 'components/jquery-cookie/jquery.cookie',
        'jquery-tmpl': 'components/jquery-tmpl/jquery.tmpl.min',
        'jquery-ui': 'components/jquery-ui/ui',
        jsgraph: 'components/jsgraph/dist/jsgraph',
        jsnmr: 'components/jsnmr/dist/jsnmr',
        jsoneditor: 'components/jsoneditor/dist/jsoneditor-minimalist.min',
        'json-chart': 'components/json-chart/dist/json-chart.min',
        jszip: 'components/jszip/dist/jszip.min',
        katex: 'components/katex/dist/katex.min',
        lodash: 'components/lodash/dist/lodash',
        loglevel: 'components/loglevel/dist/loglevel',
        'markdown-js': 'components/markdown-js/lib/markdown',
        marked: 'components/marked/lib/marked',
        //mathjax:            'components/MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML&amp;delayStartupUntil=configured',
        mathjs: 'components/mathjs/dist/math.min',
        'mime-types': 'browserified/mime-types/index',
        moment: 'components/moment/moment',
        'moment-duration-format': 'components/moment-duration-format/lib/moment-duration-format',
        notifyjs: 'components/notifyjs/dist/notify',
        modernizr: 'components/modernizr/modernizr',
        msa: 'lib/msa/msa.min',
        'nmr-simulation': 'components/nmr-simulation/dist/nmr-simulation',
        numeral: 'components/numeral/numeral',
        openchemlib: 'components/openchemlib/dist',
        papaparse: 'components/papa-parse/papaparse.min',
        plot: 'lib/plot/plot',
        pouchdb: 'components/pouchdb/dist/pouchdb.min',
        select2: 'components/select2/dist/js/select2.full',
        slickgrid: 'components/slickgrid/slick.grid',
        slickgrid_core: 'components/slickgrid/slick.core',
        'smart-array-filter': 'components/smart-array-filter/dist/smart-array-filter.min',
        sparkline: 'lib/jquery.sparkline/jquery.sparkline.min',
        sprintf: 'components/sprintf/dist/sprintf.min',
        superagent: 'browserified/superagent/index',
        threejs: 'components/threejs/build/three.min',
        uri: 'components/uri.js/src',
        'web-animations': 'components/web-animations-js/web-animations.min',
        x2js: 'components/x2js/xml2json.min',

        BiojsSequence: 'lib/biojs-1.0/src/main/javascript/Biojs.Sequence',
        BiojsTooltip: 'lib/biojs-1.0/src/main/javascript/Biojs.Tooltip',
        BiojsFeatureViewer: 'lib/biojs-1.0/src/main/javascript/Biojs.FeatureViewer',
        BiojsCore: 'lib/biojs-1.0/src/main/javascript/Biojs',
        BiojsMyFeatureViewer: 'modules/types/bio/feature_viewer/Biojs.MyFeatureViewer',
        BiojsDasProteinFeatureViewer: 'lib/biojs-1.0/src/main/javascript/Biojs.DasProteinFeatureViewer'
    },
    shim: {
        katex: {
            exports: 'katex'
        },
        fetch: {
            exports: 'fetch'
        },
        //mathjax: {
        //	exports: 'MathJax',
        //	init: function () {
        //		MathJax.Hub.Config({ /* Your configuration here */ });
        //		MathJax.Hub.Startup.onload();
        //		return MathJax;
        //	}
        //},
        threejs: {
            exports: 'THREE',
            init: function () {
                // Allow cross-origin images
                this.THREE.ImageUtils.crossOrigin = 'anonymous';
            }
        },
        msa: {
            exports: 'msa'
        },
        'x2js': {
            exports: 'X2JS'
        },
        'components/jit/Jit/jit': {
            exports: '$jit'
        },
        ckeditor: {
            exports: 'CKEDITOR'
        },
        modernizr: {
            exports: 'Modernizr'
        },
        'lib/parser/Parser': {
            exports: 'Parser'
        },
        'jquery-cookie': 'jquery',
        'select2': ['jquery'],
        'jsbarcode': ['jquery', 'components/jsbarcode/CODE39', 'components/jsbarcode/EAN_UPC', 'components/jsbarcode/ITF', 'components/jsbarcode/CODE128', 'components/jsbarcode/pharmacode'],
        'lib/threejs/TrackballControls': ['threejs'],
        jqgrid: ['jquery', 'components/jqgrid_edit/js/i18n/grid.locale-en'],
        'lib/couchdb/jquery.couch': ['jquery'],
        slickgrid_core: ['jquery', 'jquery-ui/widgets/sortable', 'jquery-tmpl'],
        slickgrid: {
            deps: ['slickgrid_core',
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
                'components/slickgrid/slick.editors',
                'modules/types/edition/slick_grid/slickCustomEditors',
                'modules/types/edition/slick_grid/slickCustomFormatters',
                'components/slickgrid/plugins/slick.checkboxselectcolumn',
                'components/slickgrid/controls/slick.columnpicker',
                'components/slickgrid/examples/slick.compositeeditor'],
            exports: 'Slick'
        },
        'libs/jsmol/js/JSmolApplet': ['libs/jsmol/JSmol.min.nojq'],
        'lib/flot/jquery.flot.pie': ['jquery', 'lib/flot/jquery.flot'],
        'lib/pixastic/pixastic': {
            deps: ['lib/pixastic/pixastic/pixastic.core'],
            exports: 'Pixastic'
        },
        fancytree: ['jquery-ui/effects/effect-blind', 'jquery-ui/widgets/droppable', 'jquery-ui/widgets/draggable'],
        'moment-duration-format': ['moment'],
        BiojsCore: {
            exports: 'Biojs'
        },
        BiojsSequence: ['BiojsCore'],
        BiojsTooltip: ['BiojsCore'],
        BiojsMyFeatureViewer: ['BiojsFeatureViewer'],
        BiojsFeatureViewer: [
            'BiojsCore',
            'lib/biojs-1.0/src/main/resources/dependencies/jquery/jquery.tooltip',
            'lib/biojs-1.0/src/main/resources/dependencies/graphics/raphael-2.1.2',
            'lib/biojs-1.0/src/main/resources/dependencies/graphics/canvg',
            'lib/biojs-1.0/src/main/resources/dependencies/graphics/rgbcolor'
        ],
        BiojsDasProteinFeatureViewer: ['BiojsMyFeatureViewer']
    },
    map: {
        'components/ui-contextmenu/jquery.ui-contextmenu.min': {
            'jquery-ui/menu': 'jquery-ui/widgets/menu'
        }
    }
});

window.CKEDITOR_BASEPATH = require.toUrl('components/ckeditor/');

require([
    'version',
    'jquery',
    'src/main/datas',
    'src/main/entrypoint',
    'uri/URI.fragmentQuery',
    'bluebird',
    'components/setImmediate/setImmediate',
    'lib/regenerator/regenerator-runtime'
], function (Version, $, Datas, EntryPoint, URI, Promise) {
    window.Promise = Promise;
    Promise.config({
        warnings: Version.head,
        longStackTraces: Version.head,
        monitoring: false // todo: activate and use the monitoring API. See http://bluebirdjs.com/docs/features.html
    });
    $.browser = {msie: false}; // Property used by old libraries and not present in jQuery anymore
    $(document).ready(() => {
        const url = new URI(window.location.href);
        const type = (url.search().length > 0) ? 'search' : (url.fragment()[0] === '?' ? 'fragment' : 'search');
        const query = new URI(url[type]()).query(true);
        EntryPoint.init(query, type.replace(type[0], type[0].toUpperCase()));
    });
});
