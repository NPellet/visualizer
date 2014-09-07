define( function() {

	return [ function( domGraph ) {


var data = [],
	dataL = [],
	x;

var modifiers = [];


var red = { shape: 'circle', cx: 0, cy: 0, r: 2, stroke: 'rgb(150, 0, 0 )', fill: 'rgba( 150, 0, 0, 0.3 )' };
var green = { shape: 'circle', cx: 0, cy: 0, r: 2, stroke: 'rgb( 0, 150, 0 )', fill: 'rgba( 0, 150, 0, 0.3 )' };
var blue = { shape: 'circle', cx: 0, cy: 0, r: 2, stroke: 'rgb( 0, 0, 150 )', fill: 'rgba( 0, 0, 150, 0.3 )' };

for( var i = 0; i < 300; i ++ ) {
	var x = Math.random() + 0.8;
	var y = Math.log( x );

	var dx = (Math.random() - 0.5) / 2;
	var dy = (Math.random() - 0.5) / 2;

	data.push( [ x + dx, y + dy ] );
	
	if( Math.abs( dy ) < 0.05 || Math.abs( dx ) < 0.05 ) {
		modifiers.push( blue )
	} else if( y + dy < 0 ) {
		modifiers.push( red );
	} else {
		modifiers.push( green );
	}

	dataL.push( [ x, y ] );
}

dataL.sort( function(a,b) { return a[ 0 ] - b[ 0 ] } );

var g = new Graph( domGraph );
var s = g.newSerie("s1", {}, "scatter").autoAxis().setData( data ).setDataStyle( 
	{ shape: 'circle', cx: 0, cy: 0, r: 2, stroke: 'black', fill: 'rgba( 100, 100, 100, 0.3 )' },
	modifiers
);

g.newSerie("s2", {}, "line").autoAxis().setData( dataL );

g.redraw();
g.drawSeries();


		

	}, "Scatter plot - 2", [ 


	

	]

	];

} );