define(['lib/pixastic/pixastic'], function( ) {
	
	return function( dataObject ) {
            var image = new Image();
            image.src = dataObject.get();
            var hist={};
            Pixastic.process(image,"colorhistogram",{returnValue:hist});
            return new DataObject(hist);
	};
	
});