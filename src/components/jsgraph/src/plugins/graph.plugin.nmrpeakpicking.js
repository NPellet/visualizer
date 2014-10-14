define( [], function() {

  var plugin = function() {};

  plugin.prototype = {

    init: function( graph ) {
      this.graph = graph;
    },

    process: function() {

      //		console.log( arguments );

      var series = arguments;
      //		console.log( series[ 0 ].data );
      //		console.log( series[ 0 ].getAdditionalData() );

      this.graph.newShape( {

        type: 'rect',
        pos: {
          x: 0,
          y: 1000
        },

        pos2: {
          x: 10,
          y: 100000000
        },

        fillColor: [ 100, 100, 100, 0.3 ],
        strokeColor: [ 100, 100, 100, 0.9 ],
        strokeWidth: 1

      } ).then( function( shape ) {

        shape.draw();
        shape.redraw();
      } )

    }
  }

  return plugin;
} );