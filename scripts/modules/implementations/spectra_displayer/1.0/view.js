 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.spectra_displayer == 'undefined')
	CI.Module.prototype._types.spectra_displayer = {};

CI.Module.prototype._types.spectra_displayer.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.spectra_displayer.View.prototype = {
	
	init: function() {
		this.series = {};
		this.colorvars = [];
		this.dom = $('<div />');
		this.zones = {};
		this._currentHighlights = {};
		this.module.getDomContent().html(this.dom);
	},
	
	inDom: function() {
		var cfgM = this.module.getConfiguration();
		var self = this;
		var graph = new Graph(this.dom.get(0), {
			closeRight: false, 
			closeTop: false, 
			zoomMode: cfgM.zoom ? (cfgM.zoom != "none" ? cfgM.zoom : false) : false,

			onMouseMoveData: function(e, val) {
				var min, max, x1;

				for(var k in self.zones) {

					if(!val[k])
						continue;

					for(var i in self.zones[k]) {

						min = Math.min(self.zones[k][i][0], self.zones[k][i][1]);
						max = Math.max(self.zones[k][i][0], self.zones[k][i][1]);

						x1 = val[k].trueX;

						if(min < x1 && max > x1) {
							
							CI.RepoHighlight.set(i, 1);
							self._currentHighlights[i] = 1;

						} else if(self._currentHighlights[i]) {

							CI.RepoHighlight.set(i, 0);
							self._currentHighlights[i] = 0;
						}
					}
				}

			}});
	//graph.getLeftAxis(0, {logScale: true})
		graph.getLeftAxis().setDisplay(cfgM.displayAxis ? cfgM.displayAxis.indexOf('y') > -1 : false);
		graph.getLeftAxis().setLabel(cfgM.yLabel || '');

		graph.getXAxis().setDisplay(cfgM.displayAxis ? cfgM.displayAxis.indexOf('x') > -1 : false);
		graph.getXAxis().setLabel(cfgM.xLabel || '');
		
		graph.getXAxis().setAxisDataSpacing(cfgM.xLeftSpacing || 0, cfgM.xRightSpacing || 0);
		graph.getLeftAxis().setAxisDataSpacing(cfgM.yBottomSpacing || 0, cfgM.yTopSpacing || 0);


		graph.redraw();

		this.graph = graph;
		if(cfgM.flipX)
			this.graph.getXAxis().flip(true);

		if(cfgM.flipY)
			this.graph.getLeftAxis().flip(true);		
	},
	
	onResize: function(width, height) {
		this.width = width;
		this.height = height;
		if(this.graph)
			this.graph.resize(width, height);
		this.graph.redraw();
		this.graph.drawSeries();
	},
	
	onProgress: function() {
		this.dom.html("Progress. Please wait...");
	},

	blank: function() {

		this.dom.get(0).width = this.dom.get(0).width;
	},

	doZone: function(varname, zone, value, color) {

		if(value && !zone[2]) {
			var serie = this.series[varname][0];
			var rect = this.graph.makeShape('rect');
			rect.setSerie(serie);
			rect.set('fill', color);
			rect.set('opacity', '0.5');
			rect.setByVal('x', zone[0], 'x');
			rect.setWidthByVal(zone[1]);
			rect.setFullHeight();
			rect.done();
			zone.push(rect);
		} else if(zone[2] && !value) {
			zone[2].kill();
			zone.splice(2, 1);
		}
	},

	update2: { 

		'fromTo': function(moduleValue) {
			var view = this;

			if(!moduleValue || !moduleValue.value)
				return;

			if(view.dom.data('spectra'))
				view.dom.data('spectra').setBoundaries(moduleValue.value.from, moduleValue.value.to);
			return;
		},

		'xArray': function(moduleValue, varname) {

			this.series[varname] = this.series[varname] || [];
			for(var i = 0, l = this.series[varname].length; i < l; i++)
				this.series[varname][i].kill();
			this.series[varname] = [];	

			var cfgM = this.module.getConfiguration();			
			var color, continuous;

			if(!moduleValue)
				return;

			if(cfgM.plotinfos) {
				for(var i = 0, l = cfgM.plotinfos.length; i < l; i++) {
					if(varname == cfgM.plotinfos[i].variable) {
						color = cfgM.plotinfos[i].plotcolor;
						continuous = cfgM.plotinfos[i].plotcontinuous;
					}	
				}
			}
			var val = CI.DataType.getValueIfNeeded(moduleValue);
			var val2 = [];
			for(var i = 0, l = val.length; i < l; i++) {
				val2.push(i);
				val2.push(val[i]);
			}

			serie = this.graph.newSerie(varname, {trackMouse: true, lineToZero: !continuous});
			serie.setData(val2);
			serie.autoAxis();
			if(color)
				serie.setLineColor(color);

			this.series[varname].push(serie);
			this.onResize(this.width || this.module.getWidthPx(), this.height || this.module.getHeightPx());
		},

		'jcamp': function(moduleValue, varname) {

			if(!moduleValue)
				return;
			var self = this;
			var cfgM = this.module.getConfiguration();			
			CI.RepoHighlight.kill(this.module.id + varname);

			if(!this.graph)
				return;
			this.zones[varname] = moduleValue._zones;
			
			var color, continuous;

			if(!moduleValue)
				return this.blank();

			if(cfgM.plotinfos)
				for(var i = 0, l = cfgM.plotinfos.length; i < l; i++) {
					if(varname == cfgM.plotinfos[i].variable) {
						color = cfgM.plotinfos[i].plotcolor;
						continuous = cfgM.plotinfos[i].plotcontinuous;
					}	
				}

			CI.RepoHighlight.listen(moduleValue._highlight, function(value, commonKeys) {
				for(var i = 0; i < commonKeys.length; i++) 
					if(self.zones[varname][commonKeys[i]])
						self.doZone(varname, self.zones[varname][commonKeys[i]], value, color);
			}, true, this.module.id + varname);

			this.series[varname] = this.series[varname] || [];

 			//if(typeof moduleValue.value !== 'object') {
 				var spectra = CI.converter.jcampToSpectra(moduleValue.value, {lowRes: 1024}).spectra;
 			//	moduleValue.value = spectra;
 			//} else 
 			//	spectra = moduleValue.value;
			
			for(var i = 0, l = this.series[varname].length; i < l; i++)
				this.series[varname][i].kill();
			
			this.series[varname] = [];

			for (var i=0; i<spectra.length; i++) {
				
				serie = this.graph.newSerie(varname, {trackMouse: true, lineToZero: !continuous});
				serie.setData(spectra[i].data[spectra[i].data.length - 1]);
				serie.autoAxis();

				if(color)
					serie.setLineColor(color);

				this.series[varname].push(serie);
				break;
			}
			this.onResize(this.width || this.module.getWidthPx(), this.height || this.module.getHeightPx());
		}
	},



	onActionReceive: {
		fromto: function(value, name) {
			if(this.dom.data('spectra'))
				this.dom.data('spectra').setBoundaries(value.value.from, value.value.to);
		}
	},

	
	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	}
}
 
