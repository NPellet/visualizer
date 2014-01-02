define([ ], function( API ) {
	
	return function( val ) {
console.log( val );
		return "http://dx.doi.org/" + val;
	}
	
})