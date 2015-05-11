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

requirejs.config({
    waitSeconds: 0,
    paths: {
        ace: 'components/ace/src',
        async: 'components/async/lib/async',
        bowser: 'components/bowser/bowser.min',
        chroma: 'components/chroma-js/chroma.min',
        ckeditor: 'components/ckeditor/ckeditor',
        d3: 'components/d3/d3.min',
        fancytree: 'components/fancytree/dist/jquery.fancytree-all',
        forms: 'lib/forms',
        'file-saver': 'components/file-saver.js/FileSaver',
        'highlightjs': 'lib/highlight.js/highlight.pack',
        jqgrid: 'components/jqgrid_edit/js/jquery.jqGrid',
        jquery: 'components/jquery/dist/jquery.min',
        'jquery-cookie': 'components/jquery-cookie/jquery.cookie',
        'jquery-ui': 'components/jquery-ui/ui',
        jszip: 'components/jszip/dist/jszip.min',
        loglevel: 'components/loglevel/dist/loglevel.min',
        lodash: 'components/lodash/lodash.min',
        'markdown-js': 'components/markdown-js/lib/markdown',
        marked: 'components/marked/lib/marked',
        //mathjax:            'components/MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML&amp;delayStartupUntil=configured',
        modernizr: 'components/modernizr/modernizr',
        plot: 'lib/plot/plot',
        pouchdb: 'components/pouchdb/dist/pouchdb.min',
        underscore: 'components/underscore/underscore-min',
        select2: 'components/select2/dist/js/select2.full',
        'sparkline': 'lib/jquery.sparkline/jquery.sparkline.min',
        'src/shape.1dnmr': 'components/jsNMR/src/shape.1dnmr',
        superagent: 'components/superagent/superagent',
        threejs: 'components/threejs/build/three.min',
        uri: 'components/uri.js/src',
        BiojsFeatureViewer: 'lib/biojs-1.0/src/main/javascript/Biojs.FeatureViewer',
        BiojsCore: 'lib/biojs-1.0/src/main/javascript/Biojs',
        BiojsMyFeatureViewer: 'modules/types/bio/feature_viewer/Biojs.MyFeatureViewer',
        BiojsDasProteinFeatureViewer: 'lib/biojs-1.0/src/main/javascript/Biojs.DasProteinFeatureViewer'
    },
    shim: {
        //mathjax: {
        //	exports: 'MathJax',
        //	init: function () {
        //		MathJax.Hub.Config({ /* Your configuration here */ });
        //		MathJax.Hub.Startup.onload();
        //		return MathJax;
        //	}
        //},
        d3: {
            exports: 'd3'
        },
        threejs: {
            exports: 'THREE',
            init: function () {
                // Allow cross-origin images
                this.THREE.ImageUtils.crossOrigin = 'anonymous';
            }
        },
        'components/x2js/xml2json.min': {
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
        'components/papa-parse/papaparse.min': {
            exports: 'Papa'
        },
        'jquery-cookie': 'jquery',
        'select2': {
            deps: ['jquery'],
            init: function () {
                debugger;
            }
        },
        'lib/threejs/TrackballControls': ['threejs'],
        jqgrid: ['jquery', 'components/jqgrid_edit/js/i18n/grid.locale-en'],
        'libs/jsmol/js/JSmolApplet': ['libs/jsmol/JSmol.min.nojq'],
        'lib/flot/jquery.flot.pie': ['jquery', 'lib/flot/jquery.flot'],
        'lib/pixastic/pixastic': ['lib/pixastic/pixastic/pixastic.core'],
        fancytree: ['jquery-ui/droppable'],
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
        'components/jsNMR/src/nmr': {
            'graph': 'components/jsgraph/dist/jsgraph.min',
            'assignation': 'components/jsNMR/src/assignation',
            'jcampconverter': 'components/jcampconverter/dist/jcampconverter.min',
            'lib/components/VisuMol/src/molecule': 'components/jsNMR/lib/components/VisuMol/src/molecule'
        },
        'src/shape.1dnmr': {
            'graph': 'components/jsgraph/dist/jsgraph.min'
        },//'components/jsNMR/src/shape.1dnmr'
        'lib/gcms/gcms': {
            'graph': 'components/jsgraph/dist/jsgraph.min'
        }
    }
});

require([
    'jquery',
    'src/main/datas',
    'src/main/entrypoint',
    'uri/URI.fragmentQuery',
    'components/bluebird/js/browser/bluebird.min',
    'lib/IndexedDBShim/IndexedDBShim',
    'components/setImmediate/setImmediate'
], function ($, Datas, EntryPoint, URI, Promise) {
    window.Promise = Promise;
    $.browser = {msie: false}; // Property used by old libraries and not present in jQuery anymore
    $(document).ready(function () {
        var url = new URI(window.location.href);
        var type = (url.search().length > 0) ? 'search' : (url.fragment()[0] === '?' ? 'fragment' : 'search');
        var query = new URI(url[type]()).query(true);
        EntryPoint.init(query, type.replace(type[0], type[0].toUpperCase()));
    });
});
