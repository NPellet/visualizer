/*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
 
if(typeof CI.Module.prototype._types.plot == 'undefined')
	CI.Module.prototype._types.plot = {};

CI.Module.prototype._types.plot.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.plot.View.prototype = {
	
	init: function() {	
		var html = [];
		html.push('<div />');
		this.namedSeries = {};
		this.series = [];
		this.dom = $(html.join(''));
		this.module.getDomContent().html(this.dom).css('overflow', 'hidden');
	},
	
	inDom: function() {},

	onResize: function(width, height) {
		if(this.graph)
			this.graph.resize(width, height);

		if(this.series)
			for(var i = 0, l = this.series.length; i < l; i++) {
				this.series[i].draw();
			}
	},
	
	update2: {
		'plotdata': function(moduleValue) {
		
			var serie;
			if(moduleValue === undefined || !moduleValue)
				return;
			moduleValue = CI.DataType.getValueIfNeeded(moduleValue);

			if(!this.dom)
				return;
console.time('plot');
			this._chartSource = moduleValue;
			this.series = [];
			if(this.graph)
				this.graph.kill();

			this.graph = new Graph(this.dom.get(0), moduleValue.options || {});
			var graph = this.graph;

			if(moduleValue.leftAxis) {
				graph.getLeftAxis(0).setExponentialFactor(moduleValue.leftAxis.exponentialFactor || 0);
				graph.getLeftAxis(0).setLabel(moduleValue.leftAxis.label);
				graph.getLeftAxis(0).setLineAt0(moduleValue.leftAxis.lineAt0 || false);
				if(moduleValue.leftAxis.forceMin)
					graph.getLeftAxis(0).forceMin(moduleValue.leftAxis.forceMin);
				if(moduleValue.leftAxis.forceMax)
					graph.getLeftAxis(0).forceMax(moduleValue.leftAxis.forceMax);
				graph.getLeftAxis(0).flip(!!moduleValue.leftAxis.flipped);

				graph.getLeftAxis(0).setAxisDataSpacingMin(moduleValue.leftAxis.minSpacing);
				graph.getLeftAxis(0).setAxisDataSpacingMax(moduleValue.leftAxis.maxSpacing);

			}


			if(moduleValue.xAxis) {
				graph.getXAxis(0).setExponentialFactor(moduleValue.xAxis.exponentialFactor || 0);
				graph.getXAxis(0).setLabel(moduleValue.xAxis.label);
				graph.getXAxis(0).setLineAt0(moduleValue.xAxis.lineAt0 || false);
				if(moduleValue.xAxis.forceMin)
					graph.getXAxis(0).forceMin(moduleValue.xAxis.forceMin);
				if(moduleValue.xAxis.forceMax)
					graph.getXAxis(0).forceMax(moduleValue.xAxis.forceMax);
				graph.getXAxis(0).flip(!!moduleValue.xAxis.flipped);

				graph.getXAxis(0).setAxisDataSpacingMin(moduleValue.xAxis.minSpacing);
				graph.getXAxis(0).setAxisDataSpacingMax(moduleValue.xAxis.maxSpacing);
			}


			if(moduleValue.series) {
				for(var i in moduleValue.series) {
					serie = graph.newSerie(i, moduleValue.series[i].options || {});
					serie.autoAxis();
					serie.setData(moduleValue.series[i].data);
					this.series.push(serie);
				}
			}
			
			this.onResize(this.module.getWidthPx(), this.module.getHeightPx());

			console.timeEnd('plot');
		},


		'serieSet': function(moduleValue, name) {

			var cfgM = this.module.getConfiguration();
			var color;
			if(cfgM.plotinfos)
				for(var i = 0, l = cfgM.plotinfos.length; i < l; i++) {
					if(name == cfgM.plotinfos[i].variable) {
						color = cfgM.plotinfos[i].plotcolor;
					}	
				}



			moduleValue = CI.DataType.getValueIfNeeded(moduleValue);
			if(!moduleValue)
				return;
			console.log(this.namedSeries);
			if(this.namedSeries[name]) {
				for(var i = 0, l = this.namedSeries[name]; i <= l; i++) {
					for(var j = 0, k = this.series.length; j < k; j++) {
						if(this.series[j] == null)
							continue;

						if(this.series[j].getName() == name + i) {
							this.series[j].kill();
							this.series.splice(j, 1);
						}
					}
				}
			}

			if(!(moduleValue instanceof Array))
				moduleValue = [moduleValue];

			for(var i = 0, l = moduleValue.length; i < l; i++) {
				k = 0;
				for(var j in moduleValue[i]) {

					if(!moduleValue[i][j])
						continue;
					k++
					serie = this.graph.newSerie(name + k, moduleValue[i][j].options || {});
					serie.autoAxis();
					if(color)
						serie.setLineColor(color);

					serie.setData(moduleValue[i][j].data);
					this.series.push(serie);
				}
			}

			this.namedSeries[name] = k;
			this.graph.drawSeries();
		}
	},

	onActionReceive:  {

		addSerie: function(value) {
			value = CI.DataType.getValueIfNeeded(value);
			for(var i in value) {
				this.onActionReceive.removeSerie.call(this, value[i].name)
				var serie = this.graph.newSerie(value[i].name);
				serie.autoAxis();
				serie.setData(value[i].data)
			}

			this.graph.redraw();
			this.graph.drawSeries();
		},

		removeSerie: function(serieName) {
			
			for(var i = 0, l = this.series.length; i < l; i++) {
				if(this.series[i].getName() == name) {
					this.series[i].kill();
				}
			}
		}
	},
	
	getDom: function() {
		return this.dom;
	}
}

 
