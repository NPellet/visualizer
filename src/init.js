'use strict';

requirejs.config({
	waitSeconds: 0,
	paths: {
		ace:                'components/ace/lib/ace',
		d3:                 'components/d3/d3.min',
		fancytree:          'components/fancytree/dist/jquery.fancytree-all',
		jqgrid:             'components/jqgrid_edit/js/jquery.jqGrid',
		jquery:             'components/jquery/jquery.min',
		jqueryui:           'components/jqueryui-touch-punch/jquery.ui.touch-punch.min',
		ckeditor:           'components/ckeditor/ckeditor',
		threejs:            'components/threejs/build/three.min',
		forms:              'lib/forms',
		plot:               'lib/plot/plot',
		ChemDoodle:         'lib/chemdoodle/ChemDoodleWeb-unpacked',
		pouchdb:            'components/pouchdb/dist/pouchdb.min',
		uri:                'components/uri.js/src',
		underscore:         'components/underscore/underscore',
        lodash:             'components/lodash/dist/lodash.min',
		leaflet:            'components/leaflet/dist/leaflet',
        modernizr:          'components/modernizr/modernizr',
        bowser:             'components/bowser/bowser.min',
        'jquery-cookie':    'components/jquery-cookie/jquery.cookie',
        chemcalc:           'components/chemcalc/lib'
	},
	shim: {
		d3: {
			exports: 'd3'
		},
		threejs: {
			exports: 'THREE'
		},
		'components/x2js/xml2json.min': {
			exports: 'X2JS'
		},
		leaflet: {
			exports: 'L',
			init: function() {
				return this.L.noConflict();
			}
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
		jqueryui: ['jquery','components/jquery-ui/ui/minified/jquery-ui.min'],
		ChemDoodle: ['lib/chemdoodle/ChemDoodleWeb-libs'],
		'components/farbtastic/src/farbtastic': ['components/jquery/jquery-migrate.min'],
		'lib/pixastic/pixastic': ['lib/pixastic/pixastic/pixastic.core'],
		'lib/biojs-1.0/src/main/javascript/Biojs.FeatureViewer.js': ['lib/biojs-1.0/src/main/javascript/Biojs.js'],
		'lib/biojs-1.0/src/main/javascript/Biojs.DasProteinFeatureViewer.js': ['lib/biojs-1.0/src/main/javascript/Biojs.js', 'lib/biojs-1.0/src/main/javascript/Biojs.FeatureViewer.js']
	}
});

require(['jquery', 'src/main/datas', 'src/main/entrypoint', 'uri/URI.fragmentQuery', 'components/bluebird/js/browser/bluebird.js', 'lib/IndexedDBShim/IndexedDBShim.js'], function($, Datas, EntryPoint, URI, Promise) {
	window.Promise = Promise;
	$(document).ready(function() {
			var url = new URI(window.location.href);
			var type = (url.search().length > 0) ? 'search' : (url.fragment()[0] === '?' ? 'fragment' : 'search');
			var query = new URI(url[type]()).query(true);
			EntryPoint.init(query, type.replace(type[0], type[0].toUpperCase()));
		});
});
