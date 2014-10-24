
define( function() {

	return [ function( domGraph ) {

		var serie = [];
		var date = new Date();
		date.setTime( date.getTime() - 86400000 * 3)
		
		while( date.getTime() < Date.now() ) {
		
			serie.push( date.getTime() );
			serie.push( Math.sin( date.getHours() / 24 * Math.PI + Math.random() / 5 ) );

			date.setSeconds( date.getSeconds() + 1 );
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


		}, { bottom: [ { type: 'time' } ] } );

	
		graphinstance.newSerie()
			.autoAxis()
			.setData( serie )
			.XIsMonotoneous()
			.degrade( 2 )
			.setFillColor('rgba(0,0,0,0.1)')
			.setLineColor('transparent');


		graphinstance.redraw( );
		graphinstance.drawSeries();	
			
			
		},

		"Time axis", 
		[ 

		'Noone really wants to display epoch values on an x axis. You can use <code>graph.setBottomAxisAsTime()</code> to notify that the bottom axis should be timed.',
		'It will enable a special rendering for the x axis shows the time according to the level of zooming you are using. It works great with the zoom plugin, with the data degradation and with the monotoneous option !'

		]


	];


} );
