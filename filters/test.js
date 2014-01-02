define([ 'util/api' ], function( API ) {
	
	return function( val ) {
		API.setVariable('testVar', new Date().toLocaleString());	
	}
	
})