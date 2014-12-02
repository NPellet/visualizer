
define( [ 'require', 'graph' ], function( require, Graph ) {

	"use strict";
	var lineHeight = 5;
	var GraphLine = Graph.getBuild( './shapes/graph.shape.line' )
	var GraphNmrSignal1D = function( graph, options ) {

		this.options = options || {};
		this.init( graph );
		this.nbHandles = 2;
		this.createHandles( this.nbHandles, 'rect', { 
									transform: "translate(-3 -3)", 
									width: 6, 
									height: 6, 
									stroke: "black", 
									fill: "white",
									cursor: 'nwse-resize'
								} );

	}

	$.extend(GraphNmrSignal1D.prototype, GraphLine.prototype, {
		
		createDom: function() {
			


			this._dom = document.createElementNS(this.graph.ns, 'line');
			this.maxLines = 64;
			this.nbLines = 0;

			this.maxLines = 0;


			this.lines = new Array(this.maxLines);
			


			//I dont know how to remove the previous lines, so, I'll create an array of
			//empty lines that can be filled up by the system.
			for(var i=this.maxLines-1;i>=0;i--){
				this.lines[i] = document.createElementNS( this.graph.ns, 'line');
				this.group.appendChild( this.lines[i]);
				this.lines[i].setAttribute('stroke', 'green');
			}
			
			// calculate a "hard"-threshold as in
			// IEEE Transactions on biomedical engineering, vol. 52, no. 1, january
			// 2005, p. 76-
			// keep the number of standard deviations variable
			//nbStandardDeviations=1;
			var j,mean=0,std=0,max = 0;
			var serie = this.graph.series[0].data[0];
			//console.log(serie.length);
			for(j=0;j<serie.length;j+=2){
				if(Math.abs(serie[ j + 1 ])>max)
					max = Math.abs(serie[ j + 1 ]);
			}
			for(j=0;j<serie.length;j+=2){
				mean+=serie[ j + 1 ]/max;
			}
			for(j=0;j<serie.length;j+=2)
				std+=Math.pow(mean-serie[ j + 1 ]/max,2);
			std=Math.sqrt(max)*Math.sqrt(std*2/serie.length);
			this.noiseLevel = std*3;//3 is the given number of std for nucleus 1H. For 13C it is 1.
			//console.log("noiseLevel "+this.noiseLevel);
			//this.noiseLevel = 4e6;
			
			this._dom.element = this;
		},


		redrawImpl: function() {


			this.setPosition();
			this.setPosition2();
			this.setHandles();

			this.redrawLines( lineHeight );
			

			this.setBindableToDom( this._dom );
		},


		redrawLines: function( height ) {

			if( this.maxLines == 0 ) {
				return;
			}

			var peaks = this.findxs();
			//this.lines = [];
			for(var i=peaks.length-1;i>=0;i--){
			    //TODO How to know the base of the spectrum?????
			    var baseLine = this._getPosition( { x: 10 } );
				var x1 = this._getPosition( { x: peaks[i][0] } );
				if( this.lines[i] && x1.x && this.currentPos2y && this.currentPos1y && i<this.maxLines ) {
					this.lines[i].setAttribute('stroke', 'green');
					this.lines[i].setAttribute('x1', x1.x );
					this.lines[i].setAttribute('x2', x1.x );
					this.lines[i].setAttribute('y1', x1.y);
					this.lines[i].setAttribute('y2', baseLine.y  );
					this.lines[i].setAttribute('on', true );

				}
			}
			for(var i=peaks.length;i<this.nbLines;i++){

				if( this.lines[i] ) {
				    this.lines[i].setAttribute('y1', parseFloat(this.lines[i].getAttribute('y2')));
				    this.lines[i].setAttribute('x1', -1000000 );
					this.lines[i].setAttribute('x2', -1000000 );
					this.lines[i].setAttribute('on', false );
				}
			}

			this.nbLines = peaks.length;

		},

		highLigthLinesY: function( height ) {
			for(var i=this.lines.length-1;i>=0;i--){
				if(this.lines[i].getAttribute('on')=="true")
					this.lines[i].setAttribute('y1', parseFloat(this.lines[i].getAttribute('y1'))-height);
			}
		},


		findxs: function() {
			var v1 = this.serie.searchClosestValue( this.getFromData( 'pos' ).x ),
				v2 = this.serie.searchClosestValue( this.getFromData( 'pos2' ).x ),
				v3,
				init,
				max,
				x=[],
				y=[];
				
			if(! v1 || ! v2) {
				return false;
			}
		    
			for(var i = v1.dataIndex; i <= v2.dataIndex ; i++) {

				init = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
				max = i == v2.dataIndex ? v2.xBeforeIndexArr : this.serie.data[i].length;
				k = 0;
				
				for(j = init; j <= max; j+=2) {
					x.push(this.serie.data[ i ][ j + 0 ]);
					y.push(this.serie.data[ i ][ j + 1 ]);
					
				}
			}
			
			
			
			for(var i=y.length-1;i>=0;i--)
  				if(Math.abs(y[i])<this.noiseLevel)
    				y[i]=0;
			
			var dx = x[1]-x[0];
			// fill convolution frecuency axis
			var X = []//x[2:(x.length-2)];
	
			// fill Savitzky-Golay polynomes
			var Y = new Array();
			var dY = new Array();
			var ddY = new Array();
			for (var j = 2; j < x.length -2; j++){
				Y.push((1/35.0)*(-3*y[j-2] + 12*y[j-1] + 17*y[j] + 12*y[j+1] - 3*y[j+2]));
				X.push(x[j]);
				dY.push((1/(12*dx))*(y[j-2] - 8*y[j-1] + 8*y[j+1] - y[j+2]));
				ddY.push((1/(7*Math.abs(dx*2)))*(2*y[j-2] - y[j-1] - 2*y[j] - y[j+1] + 2*y[j+2]));
			}
		
			// pushs max and min points in convolution functions
			var maxY = new Array();
			var stackInt = new Array();
			var intervals = new Array();
			var minddY = new Array();
			for (var i = 1; i < Y.length -1 ; i++)
			{
				if ((Y[i] > Y[i-1]) && (Y[i] > Y[i+1]))
				{
					maxY.push(X[i]);
				}
				if ((dY[i] < dY[i-1]) && (dY[i] < dY[i+1]))
				{
					stackInt.push(X[i]);
				}
				if ((dY[i] > dY[i-1]) && (dY[i] > dY[i+1]))
				{
					try{
						intervals.push( [X[i] , stackInt.pop()] );
					}
					catch(e){
						console.log("Error I don't know why");
					}
				}
				if ((ddY[i] < ddY[i-1]) && (ddY[i] < ddY[i+1]))
				{
					minddY.push( [X[i], Y[i]] );
				}
			}
		    //console.log(intervals.length);
			// creates a list with (frecuency, linewith, height)
			var signals = new Array();
			for (var j = 0; j < minddY.length; j++)
			{
				var f = minddY[j];
				var frecuency = f[0];
				var possible = new Array();
				for (var k=0;k<intervals.length;k++){
				    var i = intervals[k];
					if (frecuency > i[0] && frecuency < i[1])
						possible.push(i);
				}
				//console.log("possible "+possible.length);
				if (possible.length > 0)
					if (possible.length == 1)
					{
						var inter = possible[0];
						var linewith = inter[1] - inter[0];
						var height = f[1];
						var points = Y;
						//console.log(frecuency);
						points.sort(function(a, b){return a-b});
						if ((linewith > 2*dx) && (height > 0.0001*points[0]))
							signals.push( [frecuency, linewith, height] );
					}
					else
					{
						//TODO: nested peaks
					//	console.log(possible);
					}
			}
			//console.log(signals);
			return signals;
		},

		highlight: function() {

			if( this.isBindable() ) {
				this._dom.setAttribute('stroke-width', '5');
				this.highLigthLinesY( 2 );
			}
		},


		unhighlight: function() {

			if( this.isBindable() ) {
				this.setStrokeWidth();
				this.highLigthLinesY( -2 );
			}
		}
	});

	return GraphNmrSignal1D;
});
