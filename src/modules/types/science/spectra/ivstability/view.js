define(['modules/default/defaultview', 'lib/plot/plot', 'src/util/datatraversing', 'src/util/urldata'], function(Default, Graph, Traversing, LRU) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		init: function() {	
			var html = [];
			html.push('<div class="ivstab"><div class="iv"><h2>IV Curve</h2><div class="ivcurve"></div><h2>Legend</h2><div class="ivstablegend"></div></div><div class="stab"><div><h2>Voc</h2><div class="ivstability-voc"></div><h2>Jsc</h2><div class="ivstability-jsc"></div><h2>Fill Factor</h2><div class="ivstability-ff"></div><h2>Efficiency</h2><div class="ivstability-efficiency"></div></div></div></div>');
			this.namedSeries = {};
			this.graphs = [];
			this.series = {};
			this.ivseries = {};
			this.colors = ['#0066cc', '#cc0033', '#cc00cc', '#00cccc', '#009933', '#999966', '#cc9900', '#669999', '#000000'];
			this.usedColors = [];

			this.legends = [];
			this.dom = $(html.join(''));
			this.legendDom = this.dom.find('.ivstablegend')
			this.module.getDomContent().html(this.dom).css('overflow', 'hidden');
		},

		doIv: function(lineId, name, val, color, dashing) {

			if(!this.ivseries[name])
				this.ivseries[name] = {};

			if(!this.ivseries[name][lineId]) {
				this.ivseries[name][lineId] = this.iv.newSerie(name);
				this.ivseries[name][lineId].autoAxis();
			}
			this.ivseries[name][lineId].setData(val.data);
			this.ivseries[name][lineId].setLineColor(color);
			this.ivseries[name][lineId].setLineStyle(dashing);
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
				zoomMode: 'xy',
				defaultMouseAction: 'zoom',

				defaultWheelAction: 'none',
				lineToZero: false,
				fontSize: 12,
				fontFamily: 'Myriad Pro, Helvetica, Arial',


				onMouseMoveData: function(e, val) {
					/*console.log(val);*/
					/*for(var i in val) {
						LRU.get('http://lpidb.epfl.ch/content/ajax/getstabilityiv.ajax.php?id=' + i +'&date=' + val[i].xBefore).done(function(data) {
					    	for(var i in data) {
					        	self.doIv(i, data[i], self.graphs[0].getSerie(i).getLineColor());
					    	}
					    });
					}*/
				},

				onVerticalTracking: function(lineId, val, dasharray) {

					for(var i in self.series) {
						LRU.get('http://lpidb.epfl.ch/content/ajax/getstabilityiv.ajax.php?id=' + i +'&date=' + val).done(function(data) {
					    	for(var i in data) {
					        	self.doIv(lineId, i, data[i], self.graphs[0].getSerie(i).getLineColor(), dasharray);
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

		onResize: function() {
			for(var i = 0; i < 4; i++) {
				this.graphs[i].resize(650, 175);
				this.graphs[i].drawSeries();
			}
			this.iv.resize(500, 200);
			this.iv.drawSeries();
		},
		
		update: {
			'plotdata': function(moduleValue) {
			
			},

			'serieSet': function(moduleValue, name) {

			}
		},

		getNextColor: function() {
			return this.colors.shift();
		},

		editCellComment: function(cellId, comment) {
			$.get('http://lpidb.epfl.ch/content/ajax/setcellcomment.ajax.php', { cellid: cellId, comment: comment });
		},

		addLegend: function(id, name, description, color) {
			var div = $("<div />");
			this.legends[id] = div;
			var self = this;
			var defaultText = "(Insert a comment here)";

			square = $("<div />").css({
				width: 30,
				height: 30,
				backgroundColor: color,
				float: 'left',
				'position': 'relative',
				marginTop: '0px',
				marginBottom: '10px'
			});

			nameDom = $("<div />").css({
				marginLeft: '35px',
				fontSize: '1.1em'
			}).text(name);

			descriptionDom = $("<div />").css({
				marginLeft: '35px',
				marginTop: '2px'
			}).attr('contentEditable', 'true').text(description || defaultText)

			.bind('mousedown', function() {
				if($(this).text() == defaultText)
					$(this).text("").css({ color: 'black', fontStyle: 'normal' }).focus();

			}).bind('keypress', function(e) {

				if(e.keyCode == 13) {
					e.preventDefault();
					$(this).trigger('blur');
					return false;
				}

			}).bind('blur', function() {
				var text = $(this).text();
				if(text == "" || text == null || text == defaultText)
					$(this).text(defaultText).css({ color: 'grey', fontStyle: 'italic' });
				else {
					self.editCellComment(id, text);
				}

			}).bind('change', function() {
				
			}).trigger('blur');




			clearDom = $("<div />").css({
				'clear': 'both'
			});

			div.append(square).append(nameDom).append(descriptionDom).append(clearDom);
			this.legendDom.append(div);
		},

		removeLegend: function(name) {
			if(!this.legends[name])
				return;

			this.legends[name].remove();
			delete this.legends[name];
		},

		onActionReceive:  {

			addSerie: function(value) {
				
				value = Traversing.getValueIfNeeded(value);
				var options = { trackMouse: true };

				this.onActionReceive.removeSerieByName.call(this, value.id);
				var color = this.getNextColor();

				this.series[value.id] = [];

				var serie = this.graphs[0].newSerie(value.id, options);
				serie.setLineColor(color);
				serie.autoAxis();
				
				serie.setData(value.curves.jsc);
				this.series[value.id].push(serie);

				var serie = this.graphs[1].newSerie(value.id, options);
				serie.setLineColor(color);
				serie.autoAxis();
				serie.setData(value.curves.voc);
				this.series[value.id].push(serie);

				var serie = this.graphs[2].newSerie(value.id, options);
				serie.setLineColor(color);
				serie.autoAxis();
				serie.setData(value.curves.ff);
				this.series[value.id].push(serie);

				var serie = this.graphs[3].newSerie(value.id, options);
				serie.setLineColor(color);
				serie.autoAxis();
				serie.setData(value.curves.eff);
				this.series[value.id].push(serie);

				for(var i = 0; i < 4; i++) {
					this.graphs[i].redraw();
					this.graphs[i].drawSeries();
				}

				this.addLegend(value.id, value.name, value.description, color);
			},

			removeSerie: function(serie) {
				var val = Traversing.getValueIfNeeded(serie);
				this.removeLegend(val.id);
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

				for(var i in this.ivseries[serieName])
					this.ivseries[serieName][i].kill();

				delete this.ivseries[serieName];
			}
		},
		
		getDom: function() {
			return this.dom;
		}
	});

	return view;
});

 
