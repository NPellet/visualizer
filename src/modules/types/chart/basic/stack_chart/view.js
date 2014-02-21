define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util','lib/flot/jquery.flot','lib/flot/jquery.flot.stack'], function(Default, Traversing, API, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		DEBUG: true,
		


		init: function() {
		
			if (this.DEBUG) console.log("Stack Chart: init");

			// When we change configuration the method init is called again. Also the case when we change completely of view
			if (! this.dom) {
				this._id = Util.getNextUniqueId();
				this.dom = $('<div id="' + this._id + '"></div>').css('height', '100%').css('width', '100%');
				this.module.getDomContent().html(this.dom);
			}


			if (this.dom) {
				// in the dom exists and the preferences has been changed we need to clean the canvas
				this.dom.empty();
				
			}
			if (this._flot) { // if the dom existed there was probably a graph or when changing of view
				delete this._flot;
			}

			// Adding a deferred allows to wait to get actually the data before we draw the chart
			// we decided here to plot the chart in the "onResize" event
			this.loadedData=$.Deferred();

			

			


			if (this.DEBUG) console.log("Stack Chart: ID: "+this._id);

			this._data=[];	// the data that will be sent to FLOT

		},
		

		inDom: function() {
			if (this.DEBUG) console.log("Stack Chart: inDom");

		},

		onResize: function() {
		
			if (this.DEBUG) console.log("Stack Chart: onResize");
			
			var self=this;
			// the size is now really defined (we are after inDom)
			// and we received the data ...
		
			this.loadedData.done(function() {
				self._plot=$.plot("#"+self._id, self._data, self._options);

				$("#"+self._id).bind("plotclick", function (event, pos, item) {
				    if (item) {
				      	console.log("Y:"+item.datapoint[1]);
				      	console.log(self._plot.getOptions());
						
				    }
				});
				$("#"+self._id).bind("plothover", function (event, pos, item) {
				    if (item) {
				    	self.module.controller.elementHover(self._data[item.seriesIndex]);
				    } else {
				    	self.module.controller.elementOut();
				    }
				});

				for (var i=0; i<self._data.length; i++) {
					var currentDataPoint=i;
					API.listenHighlight( self._data[i], function( onOff, key ) {

						// we need to highlight the correct shape ...
						console.log(onOff, key, currentDataPoint);
						if (onOff) {
							//console.log(i);
							self._plot.highlight(0, currentDataPoint);
						} else {
							self._plot.unhighlight(0, currentDataPoint);
						}
					});
				}
				


			})
		},
		
		/* When a value change this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {
			'chart': function(moduleValue) {
				if (this.DEBUG) console.log("stack Chart: update from chart object");

				if (! moduleValue || ! moduleValue.value) return;
				console.log(moduleValue.get().data[0].preference);
				this.updateOptions(moduleValue.get().data[0].preference);
				this._convertChartToData(moduleValue.get());

				// data are ready to be ploteed
				this.loadedData.resolve();
			},
			
			
		},
		
		_convertChartToData: function(value) {
			
			this._data = [];
			var self=this;
			if ( ! value.data instanceof Array || ! value.data[0] || ! value.data[0].x instanceof Array) return;
			if (value.data.length>0) {
				console.log("for the moment stack Chart module can only display the first serie of data")
			}
			var x=value.data[0].x;
			var y=value.data[0].y;
			var highlight=value.data[0]._highlight;
			var infos=value.data[0].info;
			//we suppose there is the same number of x as y axis
			//if there are any additional y numbers without the corresponding x, they will be ignored for the moment!
			for (var i = 0; i < x.length; i++) {
			var s = [];
			 s = [x[i], y[i]];
				this._data[i] = {
					data: [s]
				}
				 
				if (highlight instanceof Array && highlight.length>i) {
					if (highlight[i] instanceof Array) {
						this._data[i]._highlight=highlight[i];
					} else {
						this._data[i]._highlight=[highlight[i]];
					}
				}
				
				if (infos instanceof Array && infos.length>i) {
					// Data can be retrieved async so to fetch an information from the "info" object we need this strange code
					Traversing.getValueFromJPath(infos[i],"element.name").done(function(elVal) {
						self._data[i].label=elVal;
						self._data[i].info=infos[i];
					});
				} 				
			}
			
		},

		updateOptions: function(preference) {
			var points,bars,lines;
			switch (preference)
				{
				  case 'points': points = true;
							break;
				  case 'bars': bars = true;
							break;
				  case 'lines': lines = true;
							break;
				  default:  bars = true
				}
			this._options = {
			
				xaxis: {
				show: true,
				min: 0
				},
				yaxis: {
				min: 0
				},
				grid: {
					
					clickable:true,
					hoverable:true
				},
				series: {
					/*lines: {
						show: true,
						fill: 0.5,
						steps: false
					}*/
					lines: { show: lines, lineWidth: 60, fill: true},
					points: { show: points, fill: false },
					bars: { show: bars, barWidth: 0.5 }
					
				}
				
			};


	 		var cfg = $.proxy( this.module.getConfiguration, this.module );

			this._options.test=cfg('nodeSize') || 1;

		}


	});

	return view;
});