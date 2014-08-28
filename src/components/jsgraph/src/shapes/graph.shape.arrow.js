
define( [ './graph.shape.line' ], function( GraphLine ) {

	var GraphArrow = function(graph) {
		this.init(graph);

	}

	$.extend(GraphArrow.prototype, GraphLine.prototype, {
		createDom: function() {
			this._dom = document.createElementNS(this.graph.ns, 'line');
			this._dom.setAttribute('marker-end', 'url(#arrow' + this.graph._creation + ')');
		}
	});

	return GraphArrow;

});