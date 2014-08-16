requirejs.config({
	waitSeconds: 0,
	paths: {
		ace: "components/ace/lib/ace",
		d3: "components/d3/d3.min",
		fancytree: "components/fancytree/dist/jquery.fancytree-all",
		jqgrid: "components/jqgrid_edit/js/jquery.jqGrid",
		jquery: "components/jquery/jquery.min",
		jqueryui: "components/jquery-ui/ui/minified/jquery-ui.min",
		ckeditor: "components/ckeditor/ckeditor",
		threejs: "components/three.js/build/three.min",
		forms: "lib/forms",
		plot: "lib/plot/plot",
		ChemDoodle: "lib/chemdoodle/ChemDoodleWeb-unpacked",
		pouchdb: "components/pouchdb/dist/pouchdb-nightly.min",
		uri: "components/uri.js/src",
		underscore: "components/underscore/underscore",
        lodash: "components/lodash/dist/lodash.min",
		leaflet: "components/leaflet/dist/leaflet",
        modernizr: "components/modernizr/modernizr",
        bowser: "components/bowser/bowser.min",
        'jquery-cookie': 'components/jquery-cookie/jquery.cookie'
	},
	shim: {
		"d3": {
			exports: "d3"
		},
		"threejs": {
			exports: "THREE"
		},
		"components/x2js/xml2json.min": {
			exports: "X2JS"
		},
		"leaflet": {
			exports: "L",
			init: function() {
				return this.L.noConflict();
			}
		},
		"components/jit/Jit/jit": {
			exports: "$jit"
		},
		"ckeditor": {
			exports: "CKEDITOR"
		},
        modernizr: {
            exports: "Modernizr"
        },

        "jquery-cookie": "jquery",
		"components/three.js/examples/js/controls/TrackballControls": ["threejs"],
		"jqgrid": ["jquery", "components/jqgrid_edit/js/i18n/grid.locale-en"],
		"libs/jsmol/js/JSmolApplet": ["libs/jsmol/JSmol.min.nojq"],
		"lib/flot/jquery.flot.pie": ["jquery", "lib/flot/jquery.flot"],
		"jqueryui": ["jquery"],
		"ChemDoodle": ["lib/chemdoodle/ChemDoodleWeb-libs"],
		"components/farbtastic/src/farbtastic": ["components/jquery/jquery-migrate.min"],
		"lib/pixastic/pixastic": ["lib/pixastic/pixastic/pixastic.core"],
		"lib/biojs-1.0/src/main/javascript/Biojs.FeatureViewer.js": ['lib/biojs-1.0/src/main/javascript/Biojs.js'],
		"lib/biojs-1.0/src/main/javascript/Biojs.DasProteinFeatureViewer.js": ['lib/biojs-1.0/src/main/javascript/Biojs.js', 'lib/biojs-1.0/src/main/javascript/Biojs.FeatureViewer.js']
	}
});

require(['jquery', 'src/main/datas'], function($, Datas) {

	"use strict";

	$(document).ready(function() {
		require(["src/main/entrypoint", "uri/URI.fragmentQuery"], function(EntryPoint, URI) {
			var url = new URI(window.location.href);
			var type = (url.search().length > 0) ? "search" : (url.fragment()[0] === "?" ? "fragment" : "search");
			var query = new URI(url[type]()).query(true);
			EntryPoint.init(query, type.replace(type[0], type[0].toUpperCase()));
		});
	});
});
