/*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
 
if(typeof CI.Module.prototype._types.ivstability == 'undefined')
	CI.Module.prototype._types.ivstability = {};

CI.Module.prototype._types.ivstability.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.ivstability.View.prototype = {
	
	init: function() {	
		var html = [];
		html.push('<div class="ivstab"><div class="iv"><h2>IV Curve</h2><div class="ivcurve"></div></div><div class="stab"><div><h2>Voc</h2><div class="ivstability-voc"></div><h2>Jsc</h2><div class="ivstability-jsc"></div><h2>Fill Factor</h2><div class="ivstability-ff"></div><h2>Efficiency</h2><div class="ivstability-efficiency"></div></div></div></div>');
		this.namedSeries = {};
		this.graphs = [];
		this.series = {};
		this.ivseries = {};
		this.colors = ['#0066cc', '#cc0033', '#cc00cc', '#00cccc', '#009933', '#999966', '#cc9900', '#669999', '#000000'];
		this.usedColors = [];

		this.dom = $(html.join(''));
		this.module.getDomContent().html(this.dom).css('overflow', 'hidden');
	},

	doIv: function(name, val, color) {
		
		if(!this.ivseries[name]) {
			this.ivseries[name] = this.iv.newSerie(name);
			this.ivseries[name].autoAxis();
		}
		
		this.ivseries[name].setData(val.data);
		
		this.ivseries[name].setLineColor(color);
		this.iv.redraw();
		this.iv.drawSeries();
	},
	
	inDom: function() {
		var self = this;
		var options = {

			paddingTop: 5,
			paddingBottom: 0,
			paddingLeft: 20,
			paddingRight: 20,

			close: {
				left: true,
				right: true, 
				top: true,
				bottom: true
			},

			title: '',
			zoomMode: 'x',
			defaultMouseAction: 'zoom',
			defaultWheelAction: 'none',
			lineToZero: false,
			fontSize: 12,
			fontFamily: 'Myriad Pro, Helvetica, Arial',

			close: {
				left: true,
				right: true,
				top: true,
				bottom: true
			},

			onMouseMoveData: function(e, val) {

				for(var i in val) {
				    $.getJSON('http://lpidb.epfl.ch/content/ajax/getstabilityiv.ajax.php', {id: i, date: val[i].xBefore}, function(data) {
				    	for(var i in data) {
				        	self.doIv(i, data[i], self.graphs[0].getSerie(i).getLineColor());
				    	}
				    });
				}
			}
		};

		var axis = {

			bottom: [
				{
					labelValue: 'Time (h)',
					unitModification: 'time',
					shiftToZero: true,
					primaryGrid: false,
					nbTicksPrimary: 10,
					secondaryGrid: false,
					axisDataSpacing: { min: 0, max: 0.1 },
				}
			],

			left: [
				{
					labelValue: '',
					ticklabelratio: 1,
					primaryGrid: true,
					secondaryGrid: false,
					nbTicksPrimary: 3,
					forcedMin: 0
				}
			]
		};


		this.graphs.push(new Graph(this.dom.find('.ivstability-jsc').get(0), options, $.extend(true, {}, axis, {
			left: [ { labelValue: 'Jsc (mA/cm2)' } ]
		})));


		this.graphs.push(new Graph(this.dom.find('.ivstability-voc').get(0), options, $.extend(true, {}, axis, {
			left: [ { labelValue: 'Voc (mV)' } ]
		})));


		this.graphs.push(new Graph(this.dom.find('.ivstability-ff').get(0), options, $.extend(true, {}, axis, {
			left: [ { labelValue: 'FF (-)' } ]
		})));


		this.graphs.push(new Graph(this.dom.find('.ivstability-efficiency').get(0), options, $.extend(true, {}, axis, {
			left: [ { labelValue: 'Efficiency (%)' } ]
		})));

		
		this.iv = new Graph(this.dom.find('.ivcurve').get(0), options, {
			bottom: [
				{
					labelValue: 'Voc (mv)',
					unitModification: false,
					shiftToZero: false,
					primaryGrid: false,
					secondaryGrid: false,
					axisDataSpacing: { min: 0, max: 0.1 },
				}
			],

			left: [
				{
					labelValue: 'Jsc (mA)',
					ticklabelratio: 1,
					primaryGrid: true,
					secondaryGrid: false,
					forcedMin: 0
				}
			]
		});

	},

	onResize: function(width, height) {
		for(var i = 0; i < 4; i++) {
			this.graphs[i].resize(650, 175);
			this.graphs[i].drawSeries();
		}

		this.iv.resize(500, 200);
		this.iv.drawSeries();

	},
	
	update2: {
		'plotdata': function(moduleValue) {
		
		},

		'serieSet': function(moduleValue, name) {

		}
	},

	getNextColor: function() {
		return this.colors.shift();
	},

	onActionReceive:  {

		addSerie: function(value) {
			
			value = CI.DataType.getValueIfNeeded(value);
			console.log(value);
			this.onActionReceive.removeSerieByName.call(this, value.name);
			var color = this.getNextColor();

			this.series[value.name] = [];

			var serie = this.graphs[0].newSerie(value.name);
			serie.setLineColor(color);
			serie.autoAxis();
			serie.setData(value.curves.jsc);
			this.series[value.name].push(serie);

			var serie = this.graphs[1].newSerie(value.name);
			serie.setLineColor(color);
			serie.autoAxis();
			serie.setData(value.curves.voc);
			this.series[value.name].push(serie);

			var serie = this.graphs[2].newSerie(value.name);
			serie.setLineColor(color);
			serie.autoAxis();
			serie.setData(value.curves.ff);
			this.series[value.name].push(serie);

			var serie = this.graphs[3].newSerie(value.name);
			serie.setLineColor(color);
			serie.autoAxis();
			serie.setData(value.curves.eff);
			this.series[value.name].push(serie);
			

			for(var i = 0; i < 4; i++) {
				this.graphs[i].redraw();
				this.graphs[i].drawSeries();
			}
		},

		removeSerie: function(serie) {
			var val = CI.DataType.getValueIfNeeded(serie);
			this.onActionReceive.removeSerieByName.call(this, val.name);
		},

		removeSerieByName: function(serieName) {

			if(this.series[serieName]) {
				this.colors.unshift(this.series[serieName][0].getLineColor());
				for(var i = 0; i < 4; i++) {
					this.series[serieName][i].kill();
				}
				delete this.series[serieName];
			}

			if(!this.ivseries[serieName])
				return;

			this.ivseries[serieName].kill();
			delete this.ivseries[serieName];
		}
	},
	
	getDom: function() {
		return this.dom;
	}
}

 
