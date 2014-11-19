
define( function() {


	return [ function( domGraph ) {

		var graphinstance = new Graph( domGraph, {

			wheel: {
				type: 'plugin',
				plugin: 'graph.plugin.zoom',
				options: {
					direction: 'y'
				}
			},

			dblclick: {
				type: 'plugin',
				plugin: 'graph.plugin.zoom',
				options: {
					mode: 'total'
				}
			},

			plugins: {
				'graph.plugin.zoom': { zoomMode: 'x' },
				'graph.plugin.drag': {}
			},

			pluginAction: {
				'graph.plugin.drag': { shift: true, ctrl: false },
				'graph.plugin.zoom': { shift: false, ctrl: false }
			}
			
		}, function( graphinstance) {
	
			graphinstance.newSerie("temp_nh")
				.autoAxis()
				.setData( series[ 3 ] );
				

			graphinstance.redraw( );
			graphinstance.drawSeries();	

		} );
		

	}, "Plugin loading", [ "Loading plugins dynamically", "Mouse wheel interaction", "Double click interaction" ] ];

} );