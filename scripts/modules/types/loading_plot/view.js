define(['modules/defaultview', 'util/util', 'libs/loadingplot/libs/jquery.mousewheel.min', 'libs/loadingplot/svg', 'libs/loadingplot/point', , 'libs/loadingplot/springs'], function(Default, Util) {
	
	Util.loadCss('libs/loadingplot/svg.css');

	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		
		init: function() {	
			this.dom = $('<div class="ci-display-loading-plot"></div>');
			this.module.getDomContent().html(this.dom);
			
			this._highlights = this._highlights || [];
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

		update: {

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

			center: function(val) {
				if(!val)
					return;
				this._svg.setCenter.apply(this._svg, val);
			},

			zoom: function(val) {
				console.log(val);
				if(!val)
					return;
				this._svg.setZoom(val);
			},

			viewport: function(viewport) {
				if(!viewport)
					return;

				this._svg.setViewBox.apply(this._svg, [false].concat(viewport));
			},

			loading: function(moduleValue) {
			
				var self = this;
				if(!moduleValue || !moduleValue.value)
					return;

				
				/*for(var i = 0; i < this._highlights.length; i++) {
					if(!this._highlights[i][0])
						continue;
					
		//			CI.RepoHighlight.unListen(this._highlights[i][0], this._highlights[i][1]);
				}*/

				this._highlights = [];

				if(this._svg) {
					this._svg.remove();
					this.dom.empty();
				}

				var svg = new LoadingPlot.SVG(null, null, null, null, this.module.getConfiguration().navigation || false);

				svg.onZoomChange(function(zoom01) {
					self.module.controller.onZoomChange(zoom01);
					self.module.controller.onChangeViewport(svg.getViewBox());
				});

				svg.onMove(function(cx, cy) {
					self.module.controller.onMove(cx, cy);
					self.module.controller.onChangeViewport(svg.getViewBox());
				});


				this._svg = svg;

				if(this._w && this._h)
					svg.setSize(this._w, this._h);

				var minX = moduleValue.value.minX || 0;
				var minY = moduleValue.value.minY || 0;

				var widthX = (moduleValue.value.maxX || 100) - minX;
				var widthY = (moduleValue.value.maxY || 100) - minY;

				svg.setViewBoxWidth(minX, minY, widthX, widthY, true);

				svg.create();

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
								else if(type == 'img')
									var el = new LoadingPlot.Image(svg, datas[k].x, datas[k].y, datas[k]);
								el.allowLabelDisplay(layers[i].displayLabels);
								if(layers[i].color)
									el.setColor(layers[i].color);
								if(layers[i].labelsize)
									el.setLabelSize(layers[i].labelsize);
								el.forceField(layers[i].forceField);
								if(layers[i].labelzoomthreshold !== '')
									el.setLabelDisplayThreshold(layers[i].labelzoomthreshold);

								el.setHighlightMag(layers[i].highlightEffect ? (layers[i].highlightEffect.mag) : 1);
								el.setHighlightEffect(layers[i].highlightEffect);
								
								
								el.setLabelStroke(layers[i].blackstroke);
								el.setLabelScale(layers[i].scalelabel);
								var fnc = $.proxy(el.highlight, el);

						//var id = CI.RepoHighlight.listen(datas[k]._highlight, fnc);
							//	this._highlights.push([datas[k]._highlight, id]);

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
					this.update.preferences.call(this, this._lastConf);
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
 
 