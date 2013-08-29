define(['modules/defaultview', 'libs/plot/plot', 'util/jcampconverter', 'util/datatraversing', 'util/api', 'util/util'], function(Default, Graph, JcampConverter, DataTraversing, API, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {
			this.series = {};
			this.colorvars = [];
			this.dom = $('<div />');
			this.zones = {};
			this._currentHighlights = {};
			this.module.getDomContent().html(this.dom);
			this.seriesActions = [];
			this.colorId = 0;
			this.colors = ["red", "blue", "green", "black"];
			this.onReady = $.Deferred();
		},
		
		inDom: function() {

			var cfgM = this.module.getConfiguration();
			var self = this;

			var graph;
			var def = $.Deferred();

			if(cfgM.graphurl) {
					
				$.getJSON(cfgM.graphurl, {}, function(data) {

					data.options.onMouseMoveData = function(e, val) {
						self.module.controller.sendAction('mousetrack', val);
					}

				 	def.resolve(new Graph(self.dom.get(0), data.options, data.axis));
				});

			} else {

				var graph = new Graph(this.dom.get(0), {

					close: {
						left: true,
						right: true,
						top: true,
						bottom: true
					},

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
									//CI.RepoHighlight.set(i, 1);
									self._currentHighlights[i] = 1;
								} else if(self._currentHighlights[i]) {
									//CI.RepoHighlight.set(i, 0);
									self._currentHighlights[i] = 0;
								}
							}
						}

					}});

		//graph.getLeftAxis(0, {logScale: true})
				graph.getLeftAxis().setDisplay(cfgM.displayAxis ? cfgM.displayAxis.indexOf('y') > -1 : false);
				graph.getLeftAxis().setLabel(cfgM.yLabel || '');

				graph.getXAxis().setDisplay(cfgM.displayAxis ? cfgM.displayAxis.indexOf('x') > -1 : true);
				graph.getXAxis().setLabel(cfgM.xLabel || '');

				graph.getXAxis().togglePrimaryGrid(cfgM.grids ? cfgM.grids.indexOf('vmain') > -1 : false);
				graph.getXAxis().toggleSecondaryGrid(cfgM.grids ? cfgM.grids.indexOf('vsec') > -1 : false);
			
				graph.getYAxis().togglePrimaryGrid(cfgM.grids ? cfgM.grids.indexOf('hmain') > -1 : false);
				graph.getYAxis().toggleSecondaryGrid(cfgM.grids ? cfgM.grids.indexOf('hsec') > -1 : false);
				
				graph.getXAxis().setAxisDataSpacing(cfgM.xLeftSpacing || 0, cfgM.xRightSpacing || 0);
				graph.getLeftAxis().setAxisDataSpacing(cfgM.yBottomSpacing || 0, cfgM.yTopSpacing || 0);

				graph.setDefaultWheelAction(cfgM.wheelAction || 'none');

				if(cfgM.minX)
					graph.getXAxis().forceMin(cfgM.minX);
				if(cfgM.minY)
					graph.getLeftAxis().forceMin(cfgM.minY);
				if(cfgM.maxX)
					graph.getXAxis().forceMax(cfgM.maxX);
				if(cfgM.maxY)
					graph.getLeftAxis().forceMax(cfgM.maxY);


				graph.getLeftAxis().setAxisDataSpacing(cfgM.yBottomSpacing || 0, cfgM.yTopSpacing || 0);
				def.resolve(graph);
			}

			$.when(def).then(function(graph) {

				if(!graph)
					return;
				graph.redraw();
				self.graph = graph;
				
				if(cfgM.flipX)
					self.graph.getXAxis().flip(true);

				if(cfgM.flipY)
					self.graph.getLeftAxis().flip(true);

				self.onResize(self.width || self.module.getWidthPx(), self.height || self.module.getHeightPx());		
				self.onReady.resolve();
			});
		},
		
		onResize: function(width, height) {
			this.width = width;
			this.height = height;
			if(this.graph) {
				this.graph.resize(width, height);
				this.graph.redraw();
				this.graph.drawSeries();
			}
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

		update: { 

			'fromTo': function(moduleValue) {
				var view = this;

				if(!moduleValue || !moduleValue.value)
					return;

				if(view.dom.data('spectra'))
					view.dom.data('spectra').setBoundaries(moduleValue.value.from, moduleValue.value.to);
				return;
			},

			'xArray': function(moduleValue, varname) {
				var cfgM, color, continuour, val, val2;
				cfgM = this.module.getConfiguration()

				this.series[varname] = this.series[varname] || [];
				this.removeSerie(varname);
				this.series[varname] = [];	
	 
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
				
				val = Traversing.getValueIfNeeded(moduleValue),
				val2 = [];

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

			'annotation': function(value) {

				value = DataTraversing.getValueIfNeeded(value);
				if(!value)
					return;
				this.annotations = value;
				this.resetAnnotations();
			},

			'jcamp': function(moduleValue, varname) {

				if(!moduleValue)
					return;

				moduleValue = DataTraversing.getValueIfNeeded(moduleValue);

				var self = this, serie, cfgM = this.module.getConfiguration(), color, continuous, i, l, spectra;
				API.killHighlight(this.module.id + varname);

				if(!this.graph)
					return;
				this.zones[varname] = moduleValue._zones;
				if(!moduleValue)
					return this.blank();

				if(cfgM.plotinfos) {
					for(i = 0, l = cfgM.plotinfos.length; i < l; i++) {

						if(varname == cfgM.plotinfos[i].variable) {
							color = cfgM.plotinfos[i].plotcolor;
							continuous = cfgM.plotinfos[i].plotcontinuous;
						}	
					}
				}
/*
				CI.RepoHighlight.listen(moduleValue._highlight, function(value, commonKeys) {
					for(var i = 0; i < commonKeys.length; i++) 
						if(self.zones[varname][commonKeys[i]])
							self.doZone(varname, self.zones[varname][commonKeys[i]], value, color);
				}, true, this.module.id + varname);
*/
	 			//if(typeof moduleValue.value !== 'object') {

	 			//var spectra = CI.converter.jcampToSpectra(moduleValue.value, {lowRes: 1024});
	 			
				spectra = JcampConverter(moduleValue, {lowRes: 1024});

	 			//	moduleValue.value = spectra;
	 			//} else 
	 			//	spectra = moduleValue.value;


				this.series[varname] = this.series[varname] || [];
				this.removeSerie(varname);
				this.series[varname] = [];

				if(spectra.contourLines) {
					
					this.graph.setOption('zoomMode', 'xy');
					this.graph.setOption('defaultWheelAction', 'toSeries');
					this.graph.setOption('defaultMouseAction', 'drag');

					serie = this.graph.newSerie(varname, {trackMouse: true, lineToZero: !continuous}, 'contour');
					serie.setData(spectra.contourLines);
					serie.autoAxis();
					if(color)
						serie.setLineColor(color);
					this.series[varname].push(serie);
				} else {


					this.graph.setOption('zoomMode', cfgM.zoom ? (cfgM.zoom != "none" ? cfgM.zoom : false) : false);
					this.graph.setOption('defaultWheelAction', 'zoomY');
					this.graph.setOption('defaultMouseAction', 'zoom');

					spectra = spectra.spectra;
					for (var i=0, l = spectra.length; i<l; i++) {
						serie = this.graph.newSerie(varname, {trackMouse: true, lineToZero: !continuous});
						serie.setData(spectra[i].data[spectra[i].data.length - 1]);
						serie.autoAxis();
						if(color)
							serie.setLineColor(color);
						this.series[varname].push(serie);
						break;
					}
				}

				this.onResize(this.width || this.module.getWidthPx(), this.height || this.module.getHeightPx());
				this.resetAnnotations();
			}
		},

		redo: function() {

			var twoD = false;
			for(var i = 0, l = this.series.length; i < l; i++) {
				if(this.series[i].twoD)
					twoD = true;
			}

			if(this.oneD && twoD)
				this.reset(true);
			else if(!this.oneD && !twoD)
				this.reset(false);
			
			
		},

		reset: function(twoD) {
			this.oneD = !twoD;
			var cfgM = this.module.getConfiguration();			
			if(twoD) {

				this.graph = new Graph_2D($("#Chart").get(0));

			} else {

				this.graph = new Graph(this.dom.get(0), {
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
					}
				});
			}
		},

		resetAnnotations: function() {

			Util.doAnnotations(this.annotations, this.graph)
		},

		removeSerie: function(serieName) {
			if(this.series[serieName])
				for(var i = 0; i < this.series[serieName].length; i++)
					this.series[serieName][i].kill();
		},

		onActionReceive: {
			fromto: function(value, name) {
				if(this.dom.data('spectra'))
					this.dom.data('spectra').setBoundaries(value.value.from, value.value.to);
			},

			addSerie: function(value) {
				this.colorId++;
				value = Traversing.getValueIfNeeded(value);
				for(var i in value) {
					this.onActionReceive.removeSerieByName.call(this, value[i].name || {});
					var serie = this.graph.newSerie(value[i].name);
					serie.autoAxis();
					serie.setData(value[i].data);
					serie.setLineColor(this.colors[this.colorId % this.colors.length]);
					this.seriesActions.push([value, serie, value[i].name]);
				}

				this.graph.redraw();
				this.graph.drawSeries();
			},

			removeSerie: function(value) {	
				value = Traversing.getValueIfNeeded(value);
				for(var i = 0, l = this.seriesActions.length; i < l; i++) {
					if(this.seriesActions[i][0] == value) {
						this.seriesActions[i][1].kill();
						this.seriesActions.splice(i, 1);
					}
				}
			},

			removeSerieByName: function(value) {	
				for(var i = 0; i < this.seriesActions.length; i++) {
					if(this.seriesActions[i][2] == value) {
						this.seriesActions[i][1].kill();
						this.seriesActions.splice(i, 1);
						i--;
					}
				}
			}
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		}
	});
	return view;
});
 

