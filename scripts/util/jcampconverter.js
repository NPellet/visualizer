// Define as an amd module
define(['require'], function(require) {

    if( ! this.worker ) {
        var url = require.toUrl('util/jcampconverter_worker.js');
        this.worker = new Worker( url );
        this.stamps = { };

        var self = this;
        worker.addEventListener('message', function( event ) {
            
            var stamp = event.data.stamp;
            if( self.stamps[ stamp ] ) {
                self.stamps[ stamp ].resolve( event.data.output );
            }

        });
    }
    
    return function( input ) {

        var stamp = Date.now( ) + Math.random( );
        this.worker.postMessage( { stamp: stamp, input: input } );
        this.stamps[ stamp ] = $.Deferred( );
        return this.stamps[ stamp ];
    }
});