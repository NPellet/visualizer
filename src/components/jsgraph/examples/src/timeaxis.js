
define( function() {

	return [ function( domGraph ) {

		var serie = [];
		var date = new Date();
		date.setTime( date.getTime() - 86400000 * 3)
		
		while( date.getTime() < Date.now() ) {
		
			serie.push( date.getTime() );
			serie.push( Math.sin( date.getHours() / 24 * Math.PI + Math.random() / 5 ) );

			date.setSeconds( date.getSeconds() + 20 );
		}

		var graphinstance = new Graph( domGraph, {


			plugins: {
				'graph.plugin.zoom': { zoomMode: 'x' }
			},

			pluginAction: {
				'graph.plugin.zoom': { shift: false, ctrl: false }
			},


			dblclick: {
				type: 'plugin',
				plugin: 'graph.plugin.zoom',
				options: {
					mode: 'total'
				}
			},


		} );

		graphinstance.setBottomAxisAsTime();
	
		graphinstance.newSerie()
			.autoAxis()
			.setData( serie );

		graphinstance.redraw( );
		graphinstance.drawSeries();	

			
			

		}, 

		"Time axis", 
		[ 'Basic chart', 'Axis labels', 'Set graphinstance dimension'] 

	];


} );
