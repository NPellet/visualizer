
define( function() {

	var options = {};
	var hashtag = (document.location.href.split("#")[ 1 ] || "").split(';').map( function( val ) {
		val = val.split(':');
		options[ val[ 0 ] ] = val[ 1 ];
	});

	var examples;
	if( options.examples ) {

		examples = options.examples.split(',').map( function( val ) { return './examples/src/' + val } );

	} else {

		examples = [
			'./examples/src/basic',
			'./examples/src/axis',
			'./examples/src/markers',
			'./examples/src/contour',
			'./examples/src/errorbars',
			'./examples/src/errorbars_style',
			'./examples/src/timeaxis',
			'./examples/src/2axis',
			'./examples/src/legend',
			'./examples/src/minmax',
			'./examples/src/plugins',
			'./examples/src/scatter',
			'./examples/src/xinterval',
			'./examples/src/degradation',
			'./examples/src/degradation2',
			'./examples/src/shape'
		];

	}

	window.examples = examples;
	return examples;

});
