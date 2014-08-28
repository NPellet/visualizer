

define([ './series/graph.serie.line'], function( GraphSerie ) {

	var GraphSerieAxis = function() {};

	GraphSerie.prototype,

	$.extend( true, GraphSerieAxis.prototype, GraphSerie.prototype, {

		initExtended1: function() {
			if(this.initExtended2)
				this.initExtended2();
		},

		setAxis: function(axis) {
			this.axis = axis;
		},


		kill: function(noRedraw) {
			this.getAxis().groupSeries.removeChild(this.groupMain);
			this.getAxis().series.splice(this.getAxis().series.indexOf(this), 1);
			if(!noRedraw)
				this.graph.redraw();
		},

		getAxis: function() {
			return this.axis;
		},

		getXAxis: function() {
			return this.axis;
		},

		getYAxis: function() {
			return this.axis;
		}
	});

	return GraphSerieAxis;
});