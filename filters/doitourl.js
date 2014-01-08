define([ ], function( API ) {
	
	return function( dataObject ) {
		// the filter always receive a dataobject and is therefore typed
		// we can change the type of the object so that it can be easily displayed in another module or rendered the
		// expected way
		dataObject.type="url";
		var value=dataObject.get();
		if (value) value=value.replace(/^doi:/i,"");

		return "http://dx.doi.org/" + value;
	}
	
})