 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.loading_plot == 'undefined')
	CI.Module.prototype._types.loading_plot = {};

CI.Module.prototype._types.loading_plot.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.loading_plot.View.prototype = {
	
	init: function() {	
		this.dom = $('<div class="ci-display-loading-plot"></div>');
		this.module.getDomContent().html(this.dom);

		var self = this;
	},

	inDom: function() {},
	
	onResize: function(w, h) {
		this._w = w - 10;
		this._h = h - 10;
		if(this._w && this._h && this._svg)
			this._svg.setSize(this._w, this._h);
	},
	
	blank: function() {
		
		this.table = null;
	},

	update2: {

		preferences: function(moduleValue) {
			this._lastConf = moduleValue;
			if(!this._lastValue)
				return;

			for(var i in moduleValue) {

				// i = descriptor, family, ingredient
				for(var j = 0; j < this._lastValue.series.length; j++) {
					if(this._lastValue.series[j].category == i) {
						
						for(var k = 0; k < this._lastValue.series[j].data.length; k++) {
							this._instances[j][k].filter(moduleValue[i]);
						}
					}
				}
			}

		},


		loading: function(moduleValue) {
		
			var self = this;
			if(!moduleValue)
				return;

			LoadingPlot.initZoom = 8000;
			LoadingPlot.zoom = LoadingPlot.initZoom;

			var svg = new LoadingPlot.SVG();
			this._svg = svg;

			if(this._w && this._h)
				svg.setSize(this._w, this._h);

			svg.setViewBoxWidth(100, 100);
			svg.bindTo(this.dom);

			var Springs = new LoadingPlot.SpringLabels(svg);

			svg.initZoom();
			LoadingPlot.SVGElement.prototype.Springs = Springs;
			this._lastValue = moduleValue.value;
			this._instances = [];
			if(!moduleValue.value || !moduleValue.value.series)
				return;

			var cfg = this.module.getConfiguration();
			var layers = cfg.layers;

			for(var i = 0; i < layers.length; i++) {
				var layerId = layers[i].layer;
				var type = layers[i].display || 'ellipse';
				
				for(var j = 0; j < moduleValue.value.series.length; j++) {
					if(moduleValue.value.series[j].category == layerId) {
						var datas = moduleValue.value.series[j].data;
						for(var k = 0, l = datas.length; k < l; k++) {
							if(type == 'pie')
								var el = new LoadingPlot.Pie(svg, datas[k].x, datas[k].y, datas[k]);
							else if(type == 'ellipse')
								var el = new LoadingPlot.Ellipse(svg, datas[k].x, datas[k].y, datas[k]);
							el.allowLabelDisplay(layers[i].displayLabels);
							if(layers[i].color)
								el.setColor(layers[i].color);
							if(layers[i].labelsize)
								el.setLabelSize(layers[i].labelsize);
							el.forceField(layers[i].forceField);
							if(layers[i].labelzoomthreshold !== '')
								el.setLabelDisplayThreshold(layers[i].labelzoomthreshold);
							el.setLabelStroke(layers[i].blackstroke);
							el.setLabelScale(layers[i].scalelabel);


							el.hoverCallback = function() {
								self.module.controller.hover(this._data);
							}

							this._instances[j] = this._instances[j] || [];
							this._instances[j][k] = el;
							svg.add(el);
						}
						break;
					}
				}
			}

			svg.ready();
			Springs.resolve();

			if(this._lastConf) {
				this.update2.preferences.call(this, this._lastConf);
			}
		}
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	
	}
}

 