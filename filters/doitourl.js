define([ ], function( API ) {
	
	return function( val ) {
		console.log(val);
		val.type="url";
console.log( val );
		return "http://dx.doi.org/" + val.get();
	}
	
})