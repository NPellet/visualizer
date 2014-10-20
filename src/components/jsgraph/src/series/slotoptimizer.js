
define( [], function() {

    var slotWorker;
    var queue = {};

    function createWorker() {

        var workerUrl = URL.createObjectURL( new Blob(
            [ " ( " + 
            function() { 
              onmessage = function( e ) {

                var data = e.data.data,
                    slotNb = e.data.slotNumber,
                    slot = e.data.slot,
                    flip = e.data.flip,
                    max = e.data.max,
                    min = e.data.min,
                    slotNumber,
                    dataPerSlot = slot / (max - min);

                    var slotsData = [];

                for(var j = 0, k = data.length; j < k ; j ++ ) {

                  for(var m = 0, n = data[ j ].length ; m < n ; m += 2 ) {

                    slotNumber = Math.floor( ( data[ j ][ m ] - min ) * dataPerSlot );

                    slotsData[ slotNumber ] = slotsData[ slotNumber ] || { 
                        min: data[ j ][ m + 1], 
                        max: data[ j ][ m + 1], 
                        start: data[ j ][ m + 1],
                        stop: false,
                        x: data[ j ][ m ] };

                    slotsData[ slotNumber ].stop = data[ j ][ m + 1 ];
                    slotsData[ slotNumber ].min = Math.min( data[ j ][ m + 1 ], slotsData[ slotNumber ].min );
                    slotsData[ slotNumber ].max = Math.max( data[ j ][ m + 1 ], slotsData[ slotNumber ].max );

                  }
                }

                postMessage( { slotNumber: slotNb, slot: slot, data: slotsData, _queueId: e.data._queueId } );
              };

            }.toString() + ")()" ]

        , { type: 'application/javascript' } ) );

        slotWorker = new Worker( workerUrl );

        slotWorker.onmessage = function( e ) {
            var id = e.data._queueId;
            delete e.data._queueId;
            queue[ id ].resolve( e.data.data );
            delete queue[ id ];
        }
    }

    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    return function( toOptimize ) {

        if( ! slotWorker ) {
            createWorker();
        }

        var requestId = guid();
        toOptimize._queueId = requestId;
        queue[ requestId ] = $.Deferred();

        slotWorker.postMessage( toOptimize );
        return queue[ requestId ];
    }

} );