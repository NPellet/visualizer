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
		this.series = [];
		this.colorvars = [];
		this.dom = $('<div />');
		this.module.getDomContent().html(this.dom);
	},
	
	inDom: function() {
	
		var graph = new Graph(this.dom.get(0), {closeRight: false, closeTop: false, zoomMode: 'x'});
		graph.getLeftAxis(0).setDisplay(false);
		graph.getXAxis().setLabel('ppm');
		graph.redraw();

		var series = [];
		this.graph = graph;
		
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

	update2: { 

		'fromTo': function(moduleValue) {
			var view = this;

			if(!moduleValue || !moduleValue.value)
				return;

			if(view.dom.data('spectra'))
				view.dom.data('spectra').setBoundaries(moduleValue.value.from, moduleValue.value.to);
			return;
		},

		zoneHighlight: function(val) {
/*
			if(!val)
				return;

			this._highlightingZone = val;
			if(this._jcampValue)
				this.update2.jcamp.call(this, this._jcampValue);*/
		},

		'jcamp': function(moduleValue, varname) {

			var cfgM = this.module.getConfiguration();			
			if(!moduleValue)
				return this.blank();

			if(cfgM.plotinfos)
				for(var i = 0, l = cfgM.plotinfos.length; i < l; i++) {
					if(varname == cfgM.plotinfos[i].variable) {
						color = cfgM.plotinfos[i].plotcolor;
						continuous = cfgM.plotinfos[i].plotcontinuous;
					}	
				}

/*
			CI.RepoHighlight.kill(this.module.id + "_" + varname);
			var index;				
			this._jcampValue = moduleValue;
			var view = this;
			var cfgM = this.module.getConfiguration();

			var color = '#000000', continuous = false;

			
			

			var cfg = {
				continuous:  continuous,
				flipX: cfgM.flipX, 
				flipY: cfgM.flipY, 
				plotcolor: color,
				dom: this.dom,
				spectraid: varname
			};
			// Display the jcamp to the screen using the value and the module ref

			CI.DataType.toScreen(moduleValue, this.module, cfg).done(function(val) {
				
				if(view.dom.data('spectra'))
					view.dom.data('spectra').onZoomChange = function(minX, maxX) {
						view.module.controller.zoomChanged(minX, maxX);
					};

				view.module.updateView('fromTo');
				//view.update2.fromTo(CI.Repo.getValue(''));
				//CI.Util.ResolveDOMDeferred(view.module.getDomContent());
				CI.Grid.moduleResize(view.module);			
			});*/

			this.series[varname] = this.series[varname] || [];
 			if(cfgM.flipX)
 				this.graph.getXAxis().flip(true);

 			if(cfgM.flipY)
 				this.graph.getLeftAxis().flip(true);

 			if(typeof moduleValue.value !== 'object') {
 				var spectra = CI.converter.jcampToSpectra(moduleValue.value);
 				moduleValue.value = spectra;
 			} else 
 				spectra = moduleValue.value;
			
			for(var i = 0, l = this.series[varname].length; i < l; i++)
				this.series[varname][i].kill();
			
			this.series[varname] = [];

			for (var i=0; i<spectra.length; i++) {
				serie = this.graph.newSerie(Math.random());
				serie.setData(spectra[i].data[0]);
				serie.autoAxis();

				if(color)
					serie.setLineColor(color);

				this.series[varname].push(serie);
				break;
			}
			//this.graph.drawSeries();

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
 
