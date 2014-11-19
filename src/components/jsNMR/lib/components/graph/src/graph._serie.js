
define( [], function() {

	"use strict";

	var GraphSerieNonInstanciable = function() {
		throw "This serie is not instanciable";
	}

	GraphSerieNonInstanciable.prototype = {

		setAdditionalData: function( data ) {
			this.additionalData = data;
			return this;
		},

		getAdditionalData: function( ) {
			return this.additionalData;
		},



		kill: function( noRedraw ) {

			this.graph.plotGroup.removeChild(this.groupMain);

			if (this.picks && this.picks.length) {
				for(var i = 0, l = this.picks.length; i < l; i++) {
					this.picks[i].kill();
				}
			}

			this.graph.series.splice(this.graph.series.indexOf(this), 1);

			if( ! noRedraw ) {
				this.graph.redraw();
			}
		},

		isMinOrMax: function(bool, xy, minmax) {

			if( bool == undefined ) {
				return this._isMinOrMax.x.min || this._isMinOrMax.x.max || this._isMinOrMax.y.min || this._isMinOrMax.y.max;
			}

			if( minmax == undefined && xy != undefined ) {
				this._isMinOrMax[ xy ].min = bool;
				this._isMinOrMax[ xy ].max = bool;
				return;
			}

			if( xy != undefined && minmax != undefined ) {
				this._isMinOrMax[ xy ][ minmax ] = bool;
			}
		},


		hide: function() {
			this.shown = false;
			this.groupMain.setAttribute('display', 'none');

			this.getSymbolForLegend().setAttribute('opacity', 0.5);
			this.getTextForLegend().setAttribute('opacity', 0.5);
		},

		show: function() {
			this.shown = true;
			this.groupMain.setAttribute('display', 'block');

			this.getSymbolForLegend().setAttribute('opacity', 1);
			this.getTextForLegend().setAttribute('opacity', 1);
		},

		toggleShow: function() {
			if( ! this.shown ) {
				this.show();
				return;
			}


			this.hide();
		},


		isShown: function() {
			return this.shown;
		},

		getX: function(val) {
			return Math.round(this.getXAxis().getPx(val) * 5) / 5;
		},

		getY: function(val) {
			return Math.round(this.getYAxis().getPx(val) * 5) / 5;
		},



		isSelected: function() {
			return this.selected;
		},



		_checkX: function(val) {
			this.minX = Math.min(this.minX, val);
			this.maxX = Math.max(this.maxX, val);
		},


		_checkY: function(val) {
			this.minY = Math.min(this.minY, val);
			this.maxY = Math.max(this.maxY, val);
		},

		getName: function() {
			return this.name;
		},



	/* AXIS */


		autoAxis: function() {
			this.setXAxis( ! this.isFlipped() ? this.graph.getXAxis() : this.graph.getYAxis() );
			this.setYAxis( ! this.isFlipped() ? this.graph.getYAxis() : this.graph.getXAxis() );

			this.graph.updateAxes();
			
			return this;
		},

		setXAxis: function( axis ) {
			if(typeof axis == "Number")
				this.xaxis = this.isFlipped() ? this.graph.getYAxis(axis) : this.graph.getXAxis(axis);
			else
				this.xaxis = axis;

			return this;
		},

		setYAxis: function(axis) {
			if(typeof axis == "Number")
				this.xaxis = this.isFlipped() ? this.graph.getXAxis(axis) : this.graph.getYAxis(axis);
			else
				this.yaxis = axis;

			return this;
		},

		getXAxis: function() {
			return this.xaxis;
		},

		getYAxis: function() {
			return this.yaxis;
		},

		setAxes: function() {

			for( var i = 0 ; i < 2 ; i ++ ) {

				if( arguments[ i ] ) {
					this[ ( arguments[ i ].isXY() == 'x' ? 'setXAxis' : 'setYAxis') ]( arguments[ i ] );
				}
			}

			return this;
		},

		/* */
		

		/* DATA MIN MAX */

		getMinX: function() {
			return this.minX;
		},

		getMaxX: function() {
			return this.maxX;
		},

		getMinY: function() {
			return this.minY;
		},

		getMaxY: function() {
			return this.maxY;
		},


		getSymbolForLegend: function() {

			if( ! this.lineForLegend ) {

				var line = document.createElementNS( this.graph.ns, 'line' );
				this.applyLineStyle( line );

				line.setAttribute('x1', 5);
				line.setAttribute('x2', 25);
				line.setAttribute('y1', 0);
				line.setAttribute('y2', 0);

				line.setAttribute('cursor', 'pointer');

				this.lineForLegend = line;
			}

			return this.lineForLegend;

		},
		
		getTextForLegend: function() {

			if( ! this.textForLegend ) {

				var text = document.createElementNS( this.graph.ns, 'text' );
				text.setAttribute('transform', 'translate(35, 3)');
				text.setAttribute('cursor', 'pointer');
				text.textContent = this.getLabel( );

				this.textForLegend = text;	
			}

			return this.textForLegend;
		},

		getLabel: function() {
			return this.options.label || this.name;
		},

		setLabel: function( label ) {
			this.options.label = label;
			return this;
		},


		/* FLIP */

		setFlip: function(bol) {
			this.options.flip = bol;
		},

		getFlip: function() {
			return this.options.flip;
		},

		isFlipped: function() {
			return this.options.flip;
		}



	};

	return GraphSerieNonInstanciable;
});