
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

	var GraphShapeVerticalLine = function(graph) { this.init(graph); };
	$.extend(GraphShapeVerticalLine.prototype, GraphLine.prototype, {

		initImpl: function() {
			this._dom.style.cursor = 'ew-resize';
		},

		setEvents: function() {
			var self = this;
			this._dom.addEventListener('mousedown', function(e) {
				e.preventDefault();
				e.stopPropagation();
				self.handleMouseDown(e);
			});

			this._dom.addEventListener('mousemove', function(e) {
				e.preventDefault();
				e.stopPropagation();
				self.handleMouseMove(e);
			});

			this._dom.addEventListener('mouseup', function(e) {
				e.preventDefault();
				e.stopPropagation();
				self.handleMouseUp(e);
			});
		},

		handleMouseDown: function(e) {
			this.moving = true;
			this.graph.shapeMoving(this);
			this.coordsI = this.graph.getXY(e);
		},

		handleMouseMove: function(e) {
			if(!this.moving)
				return;
			var coords = this.graph.getXY(e),
				delta = this.graph.getXAxis().getRelPx(coords.x - this.coordsI.x),
				pos = this.getFromData('pos');
				pos.x += delta;

			this.coordsI = coords;
			this.setPosition();
/*
			if(this.graph.options.onVerticalTracking)
				this.options.onVerticalTracking(line.id, val, line.dasharray);*/
		},

		handleMouseUp: function() {
			this.moving = false;
			this.triggerChange();
		},

		setPosition: function() {
			
			var position = this._getPosition(this.getFromData('pos'));
			this.setDom('x1', position.x);
			this.setDom('x2', position.x);
			this.setDom('y1', this.graph.getYAxis().getMinPx());
			this.setDom('y2', this.graph.getYAxis().getMaxPx());
		},

		setPosition2: function() {}
	})

	return GraphArrow;

});