

requirejs.config({

	baseUrl: '../',
	paths: {
		'jquery': './lib/components/jquery/dist/jquery.min',
		'jqueryui': './lib/components/jquery-ui/ui/minified/jquery-ui.min',
		'highlightjs': './lib/lib/highlight/highlight.pack',
		'forms': './lib/lib/forms/form',
		'components': './lib/components',
		'graphs': './lib/components/graph/src'
	}
});

define( [ './src/nmr1d' ] , function( nmrhandler ) {

	"use strict";

	nmrhandler( 
		'../lib/components/jcampconverter/data/indometacin/1h.dx', 
		'../lib/components/VisuMol/moleculeA.json',
		$( "#nmr" )
	);
	
});
