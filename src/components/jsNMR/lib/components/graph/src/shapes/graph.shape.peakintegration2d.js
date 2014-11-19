
define( [ './graph.shape.rect' ], function( GraphRect ) {

	var lineHeight = 5;

	var GraphPeakIntegration2D = function( graph, options ) {

		this.options = options || {};
		this.init( graph );
		this.nbHandles = 4;

		this.createHandles( this.nbHandles, 'rect', { 
									transform: "translate(-3 -3)", 
									width: 6, 
									height: 6, 
									stroke: "black", 
									fill: "white",
									cursor: 'nwse-resize'
								} );

	}
	$.extend( GraphPeakIntegration2D.prototype, GraphRect.prototype, {
		
		createDom: function() {
			this._dom = document.createElementNS(this.graph.ns, 'rect');
			this._dom.element = this;
		},


		redrawImpl: function() {

			this.setPosition();
			this.setHandles();
			this.setBindableToDom( this._dom );
		},

		highlight: function() {

			this._dom.setAttribute('stroke-width', '5');
			
			this.setLinesY( lineHeight + 2 );

		},


		unhighlight: function() {

			this.setStrokeWidth();
			
			this.setLinesY( lineHeight );

		}


	});

	return GraphPeakIntegration2D;

});