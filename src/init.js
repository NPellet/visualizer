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
        numeral: 'components/numeral/min/numeral.min',
        moment: 'components/moment/min/moment.min',
        'moment-duration-format': 'components/moment-duration-format/lib/moment-duration-format',
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
        jcampconverter: 'components/jcampconverter/dist/jcampconverter.min',
        jqgrid: 'components/jqgrid_edit/js/jquery.jqGrid',
        slickgrid_core: 'components/slickgrid/slick.core',
        slickgrid: 'components/slickgrid/slick.grid',
        jquery: 'components/jquery/dist/jquery.min',
        'jquery-cookie': 'components/jquery-cookie/jquery.cookie',
        'jquery-ui': 'components/jquery-ui/ui',
        'jquery-tmpl': 'components/jquery-tmpl/jquery.tmpl.min',
        'notifyjs': 'components/notifyjs/dist/notify-combined.min',
        jsgraph: 'components/jsgraph/dist/jsgraph',
        jszip: 'components/jszip/dist/jszip.min',
        loglevel: 'components/loglevel/dist/loglevel.min',
        lodash: 'components/lodash/lodash.min',
        'markdown-js': 'components/markdown-js/lib/markdown',
        'mime-types': 'components/mime-types/dist/mime-types.min',
        marked: 'components/marked/lib/marked',
        //mathjax:            'components/MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML&amp;delayStartupUntil=configured',
        modernizr: 'components/modernizr/modernizr',
        openchemlib: 'components/openchemlib/dist',
        papaparse: 'components/papa-parse/papaparse.min',
        plot: 'lib/plot/plot',
        pouchdb: 'components/pouchdb/dist/pouchdb.min',
        underscore: 'components/underscore/underscore-min',
        select2: 'components/select2/dist/js/select2.full',
        'smart-array-filter': 'components/smart-array-filter/dist/smart-array-filter.min',
        sparkline: 'lib/jquery.sparkline/jquery.sparkline.min',
        sprintf: 'components/sprintf/dist/sprintf.min',
        'src/shape.1dnmr': 'components/jsNMR/src/shape.1dnmr',
        superagent: 'lib/superagent-promise/index',
        threejs: 'components/threejs/build/three.min',
        uri: 'components/uri.js/src',
        x2js: 'components/x2js/xml2json.min',
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
        threejs: {
            exports: 'THREE',
            init: function () {
                // Allow cross-origin images
                this.THREE.ImageUtils.crossOrigin = 'anonymous';
            }
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
        'lib/threejs/TrackballControls': ['threejs'],
        jqgrid: ['jquery', 'components/jqgrid_edit/js/i18n/grid.locale-en'],
        'lib/couchdb/jquery.couch': ['jquery'],
        slickgrid_core: ['jquery', 'jquery-ui/core', 'jquery-ui/sortable', 'jquery-tmpl'],
        slickgrid: {
            deps: ['slickgrid_core',
                'components/slickgrid/slick.groupitemmetadataprovider',
                'components/slickgrid/slick.dataview',
                'components/slickgrid/lib/jquery.event.drop-2.2',
                'components/slickgrid/lib/jquery.event.drag-2.2',
                'components/slickgrid/plugins/slick.cellrangedecorator',
                'components/slickgrid/plugins/slick.cellrangeselector',
                'components/slickgrid/plugins/slick.cellselectionmodel',
                'components/slickgrid/plugins/slick.rowselectionmodel',
                'components/slickgrid/slick.editors',
                'modules/types/edition/slick_grid/slick.editors.custom',
                'modules/types/edition/slick_grid/slick.formatters.custom',
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
        fancytree: ['jquery-ui/droppable'],
        'moment-duration-format': ['moment'],
        BiojsCore: {
            exports: 'Biojs'
        },
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
            'graph': 'jsgraph',
            'assignation': 'components/jsNMR/src/assignation',
            'lib/components/VisuMol/src/molecule': 'components/jsNMR/lib/components/VisuMol/src/molecule'
        },
        'src/shape.1dnmr': {
            'graph': 'jsgraph'
        }, //'components/jsNMR/src/shape.1dnmr'
        'lib/gcms/gcms': {
            'graph': 'jsgraph'
        }
    }
});

require([
    'jquery',
    'src/main/datas',
    'src/main/entrypoint',
    'uri/URI.fragmentQuery',
    'components/bluebird/js/browser/bluebird.min',
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
