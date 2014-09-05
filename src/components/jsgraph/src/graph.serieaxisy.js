
define( [ './graph.serieaxis' ], function( GraphSerieAxis ) {

	var GraphSerieAxisY = function() {};
	$.extend(GraphSerieAxisY.prototype, GraphSerieAxis.prototype, {
		
		getX: function(value) {
			
			var x = - Math.round(1000 * (((value - this.minY) / (this.maxY - this.minY)))) / 1000  * (this.axis.totalDimension - this.axis._widthLabels) - this.axis._widthLabels - 5;
			return x;
		},

		getY: function(value) {
			
			var y = Math.round(1000*(((value - this.axis.getActualMin()) / (this.axis._getActualInterval())) * (this.axis.getMaxPx() - this.axis.getMinPx()) + this.axis.getMinPx())) / 1000;
			//if((this.axis.isFlipped() && y < this.axis.getMaxPx() || y > this.axis.getMinPx()) || (!this.axis.isFlipped() && (y > this.axis.getMaxPx() || y < this.axis.getMinPx())))
		//		return;
			return y;
		},


		getMinX: function() {
			return this.minY;
		},

		getMaxX: function() {
			return this.maxY;
		},

		getMinY: function() {
			return this.minX;
		},

		getMaxY: function() {
			return this.maxX;
		}

	});


	return GraphSerieAxisY;

});