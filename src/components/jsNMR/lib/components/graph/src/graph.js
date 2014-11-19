
define([ 

	'./graph.core',
	'./graph._serie',
	'./graph.axis',
	'./graph.axis.x',
	'./graph.axis.y',
	'./graph.legend',

	'./plugins/graph.plugin.drag',
	'./plugins/graph.plugin.linking',
	'./plugins/graph.plugin.nmrpeakpicking',
	'./plugins/graph.plugin.range',
	'./plugins/graph.plugin.shape',
	'./plugins/graph.plugin.zoom',

	'./series/graph.serie.contour',
	'./series/graph.serie.line',
	'./series/graph.serie.scatter',
	'./series/graph.serie.zone',

	'./graph.serieaxis',
	'./graph.serieaxisx',
	'./graph.serieaxisy',

	'./shapes/graph.shape.areaundercurve',
	'./shapes/graph.shape.arrow',
	'./shapes/graph.shape',
	'./shapes/graph.shape.label',
	'./shapes/graph.shape.line',
	'./shapes/graph.shape.nmrintegral',
	'./shapes/graph.shape.peakintegration2d',
	'./shapes/graph.shape.peakinterval',
	'./shapes/graph.shape.peakinterval2',
	'./shapes/graph.shape.rangex',
	'./shapes/graph.shape.rect',
	
	'./graph.toolbar',
	'./graph.xaxis.time',
	'./dynamicdepencies'

	],

 function( Graph ) {

 	// Corrent naming is important here !
	return Graph;
	
});


