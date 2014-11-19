
define( [ 

		require, 
		'jquery'

	 ], function( 

		 require, 
		 $

	 ) {
	
	"use strict";


	return {

		error: function( message ) {
			console.error( message );
		},

		setAttributeTo: function( dom, properties ) {

			for( var i in properties ) {
				
				dom.setAttribute( i, properties[ i ] );
			}
		}
	}

});