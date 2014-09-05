

requirejs.config({

	baseUrl: '../',
	paths: {
		'jquery': './lib/components/jquery/dist/jquery.min'
	}
});


window.contour = window.series.contour;
window.series = window.series.numeric;

$( document ).ready( function() {

	require( [ './examples/loadexamples' ] );

});