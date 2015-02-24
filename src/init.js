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
		ace:                'components/ace/lib/ace',
		d3:                 'components/d3/d3.min',
		fancytree:          'components/fancytree/dist/jquery.fancytree-all',
		jqgrid:             'components/jqgrid_edit/js/jquery.jqGrid',
		jquery:             'components/jquery/dist/jquery.min',
		'jquery-ui':        'components/jquery-ui/jquery-ui.min',
		'jquery-tmpl':      'components/jquery-tmpl/jquery.tmpl',
		ckeditor:           'components/ckeditor/ckeditor',
		threejs:            'components/threejs/build/three.min',
		forms:              'lib/forms',
		plot:               'lib/plot/plot',
		pouchdb:            'components/pouchdb/dist/pouchdb.min',
		uri:                'components/uri.js/src',
		underscore:         'components/underscore/underscore-min',
        lodash:             'components/lodash/dist/lodash.min',
        modernizr:          'components/modernizr/modernizr',
        bowser:             'components/bowser/bowser.min',
        'jquery-cookie':    'components/jquery-cookie/jquery.cookie',
        chemcalc:           'components/chemcalc/lib',
		chroma:             'components/chroma-js/chroma.min',
		'src/shape.1dnmr':  'components/jsNMR/src/shape.1dnmr',
		loglevel:           'components/loglevel/dist/loglevel.min',
        "markdown-js":      'components/markdown-js/lib/markdown'
	},
	shim: {
		d3: {
			exports: 'd3'
		},
		threejs: {
			exports: 'THREE',
			init: function() {
				// Allow cross-origin images
				this.THREE.ImageUtils.crossOrigin = '';
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
		'lib/threejs/TrackballControls': ['threejs'],
		jqgrid: ['jquery', 'components/jqgrid_edit/js/i18n/grid.locale-en'],
		'libs/jsmol/js/JSmolApplet': ['libs/jsmol/JSmol.min.nojq'],
		'lib/flot/jquery.flot.pie': ['jquery', 'lib/flot/jquery.flot'],
		'jquery-tmpl': ['jquery'],
		'components/farbtastic/src/farbtastic': ['components/jquery/jquery-migrate.min'],
		'lib/pixastic/pixastic': ['lib/pixastic/pixastic/pixastic.core'],
		'lib/biojs-1.0/src/main/javascript/Biojs.FeatureViewer.js': ['lib/biojs-1.0/src/main/javascript/Biojs.js'],
		'lib/biojs-1.0/src/main/javascript/Biojs.DasProteinFeatureViewer.js': ['lib/biojs-1.0/src/main/javascript/Biojs.js', 'lib/biojs-1.0/src/main/javascript/Biojs.FeatureViewer.js']
	},

	map: {

	'components/jsNMR/src/nmr': {
		 'graph': 'components/jsgraph/dist/jsgraph.min',
		 'assignation': 'components/jsNMR/src/assignation',
		 'jcampconverter': 'components/jcampconverter/dist/jcampconverter.min',
		 'lib/components/VisuMol/src/molecule': 'components/jsNMR/lib/components/VisuMol/src/molecule'
	},

	'src/shape.1dnmr': {
 		'graph': 'components/jsgraph/dist/jsgraph.min',
	},//'components/jsNMR/src/shape.1dnmr'

	'lib/gcms/gcms': {
		'graph': 'components/jsgraph/dist/jsgraph.min',
	}


	}
});

require(['jquery', 'src/main/datas', 'src/main/entrypoint', 'uri/URI.fragmentQuery', 'components/bluebird/js/browser/bluebird.min', 'lib/IndexedDBShim/IndexedDBShim', 'components/setImmediate/setImmediate'], function($, Datas, EntryPoint, URI, Promise) {
	window.Promise = Promise;
	$(document).ready(function() {
			var url = new URI(window.location.href);
			var type = (url.search().length > 0) ? 'search' : (url.fragment()[0] === '?' ? 'fragment' : 'search');
			var query = new URI(url[type]()).query(true);
			EntryPoint.init(query, type.replace(type[0], type[0].toUpperCase()));
		});
});
