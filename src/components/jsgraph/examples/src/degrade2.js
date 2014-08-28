
define( function() {

	return [ function( domGraph ) {

		var serie = [];
		var date = new Date();
		date.setTime( 0 )
		
		while( date.getTime() < 86400000 * 30 ) {
		
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

			series: ['zone', 'line']

		}, function( graphinstance ) {

			var s = graphinstance.newSerie()
				.autoAxis()
				.setData( { x: 0, dx: 0.001, y: serie } )
				.XIsMonotoneous()
				.degrade( 5 );

			s.setFillColor('rgba(200, 0, 0, 0.2)')
			s.setLineWidth(0)

			graphinstance.redraw( );
			graphinstance.drawSeries();	
		});

		
		}, 

		"Degradation", 
		[ 'Degradation also works for a serie specified in dx'] 

	];


} );
