define([ ], function( API ) {
	
	return function( value, resolve ) {
		// the filter always receive a dataobject and is therefore typed
		// we can change the type of the object so that it can be easily displayed in another module or rendered the
		// expected way
		
		if (value) value=value.get().toString().replace(/^doi:/i,"");
		resolve( new DataObject({ type: 'string', value: "http://dx.doi.org/" + value }) );
	}
	
})