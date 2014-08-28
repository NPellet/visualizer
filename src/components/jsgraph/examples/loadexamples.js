
define( [ './listexamples' ], function() {

	require( arguments[ 0 ], function( ) {

		var functions = arguments;


		for( var i = 0, l = functions.length ; i < l ; i ++ ) {

			$('#graph-examples').append('<div class="graph-example"><ul id="example-' + i + '-details"></ul><h1>' + functions[ i ][ 1 ] + '</h1><div class="graph" id="example-' + i + '-graph"></div></div>');

			functions[ i ][ 0 ]("example-" + ( i ) + "-graph");

			$("#example-" + ( i ) + "-details").html(

				functions[ i ][ 2 ].map( function( val ) {
					return '<li>' + val + '</li>';
				} ).join("")

			);
		}


	})

});


