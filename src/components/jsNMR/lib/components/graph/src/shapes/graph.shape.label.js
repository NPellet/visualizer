

define( [ './graph.shape' ], function( GraphShape ) {


	var GraphLabel = function(graph) {
		this.init(graph);
	}
	$.extend(GraphLabel.prototype, GraphShape.prototype, {
		createDom: function() {
			this._dom = false;
		},

		setPosition: function() {
			var pos = this._getPosition(this.get('labelPosition'));
			if(!pos)
				return;
			
			this.everyLabel(function(i) {
				this.label[i].setAttribute('x', pos.x);
				this.label[i].setAttribute('y', pos.y);	
			});
			
		},

		redrawImpl: function() {
			this.draw();
		}
	});


	return GraphLabel;

});