/*
define( function( ) {

	return [ function( domGraph ) {

		"use strict";
		var div1 = document.createElement('div');
		var div2 = document.createElement('div');

		var domGraph = document.getElementById( domGraph );


		// BEGIN IGNORE ON BUILD


		var script = document.createElement('script');
		script.onload = function() {
		  console.log( 'gcms loaded');
		};
		script.src = "../../../examples/science/_lib/gcms.js";
		document.getElementsByTagName('head')[0].appendChild(script);



		var script = document.createElement('script');
		script.onload = function() {
		  console.log( 'jcampconverter loaded');
		};
		script.src = "../../../examples/science/_lib/jcampconverter.js";
		document.getElementsByTagName('head')[0].appendChild(script);
		// END IGNORE ON BUILD

		$.get( '../../../examples/science/_lib/gcms.jdx', {}, function( data ) {

			JcampConverter( data ).then( function( gcmsData ) {

				domGraph.appendChild( div1 );
				domGraph.appendChild( div2 );

				div2.style.width = '100%';
				div2.style.height = '100px';

				div1.style.width = '100%';
				div1.style.height = '250px';
				
				var gcmsinstance = new GCMS( div1, div2, {
					onlyOneMS: true
				} );
				
				gcmsinstance.setGC( gcmsData.gcms.gc );
				gcmsinstance.setMS( gcmsData.gcms.ms );
			})

		} )
		

	}, "Simple GC-MS", [ 

	"",
	] 



	];

});
*/

// BEGIN INGORE ON BUILD


define( ['require'], function( require ) {

	return [ function( domGraph ) {

		var div1 = document.createElement('div');
		var div2 = document.createElement('div');

		var domGraph = document.getElementById( domGraph );

		require( [ './_lib/gcms' ], function( GCMSConstructor ) {

			require( [ './_lib/jcampconverter' ], function( JcampConverter ) {

				$.get( require.toUrl( './_lib/gcms.jdx' ), {}, function( data ) {

					JcampConverter( data ).then( function( gcmsData ) {

						domGraph.appendChild( div1 );
						domGraph.appendChild( div2 );

						div2.style.width = '100%';
						div2.style.height = '100px';

						div1.style.width = '100%';
						div1.style.height = '250px';
		

						var gcms = new GCMSConstructor( div1, div2, {
							onlyOneMS: true
						} );

						
						gcms.setGC( gcmsData.gcms.gc );
						gcms.setMS( gcmsData.gcms.ms );



					})

				} )
				

			} );

			

		} );


	}, "GC-MS", [ 
	"",
	] 

	];

});

