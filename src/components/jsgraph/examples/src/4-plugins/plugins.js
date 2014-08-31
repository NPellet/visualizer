
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
		

	}, "Plugin loading", [ 


		"You can load official plugins using the <code>plugins</code> key in the graph options. Use an object indexed by the plugin name and plugin options as values to load the plugins.",
		"You can easily develop your own plugins. Copy the development code and develop your plugin in the <code>./plugins/</code> folder",
		"Call plugins on double click or on mousewheel using the <code>dblclick</code> and <code>wheel</code> parameters"

	 ] ];

} );