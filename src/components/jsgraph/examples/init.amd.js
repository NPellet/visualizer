
requirejs.config({

	baseUrl: '../',
	paths: {
		'jquery': './lib/components/jquery/dist/jquery.min',
		'graph': './dist/jsgraph'
	}
});

require( [ 'jquery', './src/graph.core', './examples/series' ] , function( $, Graph, series ) {

	window.contour = series.contour;
	window.series = series.numeric;
	window.Graph = Graph;

	var options = {};

	require( [ './examples/loadexamples'] );
	
} );