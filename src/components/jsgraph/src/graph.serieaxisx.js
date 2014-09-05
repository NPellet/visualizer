
define( [ './graph.serieaxis'], function( GraphSerieAxis ) {

	var GraphSerieAxisX = function() {};
	$.extend(GraphSerieAxisX.prototype, GraphSerieAxis.prototype, {	
		
		getY: function(value) {
			var y = - Math.round(1000 * (((value - this.minY) / (this.maxY - this.minY)))) / 1000  * (this.axis.totalDimension - this.axis._widthLabels) - this.axis._widthLabels;
			return y;
		},

		getX: function(value) {
			//console.log(value, this.axis.getActualMin())
			var x = Math.round(1000*(((value - this.axis.getActualMin()) / (this.axis._getActualInterval())) * (this.axis.getMaxPx() - this.axis.getMinPx()) + this.axis.getMinPx())) / 1000;	
			//if((this.axis.isFlipped() && (x < this.axis.getMaxPx() || x > this.axis.getMinPx())) || (!this.axis.isFlipped() && (x > this.axis.getMaxPx() || x < this.axis.getMinPx())))
			//	return;
			return x;
		},

		bindLabelHandlers: function(label) {
			var self = this;

			function clickHandler(e) {
				if(self.axis.currentAction !== false)
					return;
				self.axis.currentAction = 'labelDragging';
				e.stopPropagation();
				label.dragging = true;
				var coords = self.graph.getXY(e);
				label.draggingIniX = coords.x;
				label.draggingIniY = coords.y;
				self.labelDragging = label;
			}


			function clickHandlerMain(e) {
				if(self.axis.currentAction !== false)
					return;
				self.axis.currentAction = 'labelDraggingMain';
				e.preventDefault();
				e.stopPropagation();
				self.labelDragging = label;
			}
			
			label.labelDom.addEventListener('mousedown', clickHandler);
			label.rect.addEventListener('mousedown', clickHandler);
			label.rect.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});

			label.labelDom.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});


			label.path.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});

			label.path.addEventListener('mousedown', clickHandlerMain);
		}
	});

	return GraphSerieAxisX;

});