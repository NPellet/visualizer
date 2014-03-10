define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util','lib/flot/jquery.flot','lib/flot/jquery.flot.pie'], function(Default, Traversing, API, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		DEBUG: true,



		init: function() {
			if (this.DEBUG) console.log("Pie Chart: init");

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
			if (this._flot) { // if the dom existedd there was probably a rgraph or when changing of view
				delete this._flot;
			}

			// Adding a deferred allows to wait to get actually the data before we draw the chart
			// we decided here to plot the chart in the "onResize" event
			this.loadedData=$.Deferred();

			this.updateOptions();

			


			if (this.DEBUG) console.log("Pie Chart: ID: "+this._id);

			this._data=[];	// the data that will be sent to FLOT

		},
		

		inDom: function() {
			if (this.DEBUG) console.log("Pie Chart: inDom");

		},

		onResize: function() {
			if (this.DEBUG) console.log("Pie Chart: onResize");
			var self=this;
			// the size is now really defined (we are after inDom)
			// and we received the data ...
			this.loadedData.done(function() {
				self._plot=$.plot("#"+self._id, self._data, self._options);

				$("#"+self._id).bind("plotclick", function (event, pos, item) {
				    if (item) {
				      	cconsole.log(item.dataIndex, item.seriesIndex);
				    }
				});
				$("#"+self._id).bind("plothover", function (event, pos, item) {
				    if (item) {
				    	self.module.controller.elementHover(self._data[item.seriesIndex]);
				    } else {
				    	self.module.controller.elementOut();
				    }
				});


				API.killHighlight( self.mofule.getId());
				
				for (var i=0; i<self._data.length; i++) {
					var currentDataPoint=i;
					API.listenHighlight( self._data[i], function( onOff, key ) {

						// we need to highlight the correct shape ...
				//		console.log(onOff, key, currentDataPoint);
						if (onOff) {
							console.log(i);
							self._plot.highlight(0, currentDataPoint);
						} else {
							self._plot.unhighlight(0, currentDataPoint);
						}
					}, false, self.module.getId());
				}
				


			})
		},
		
		/* When a vaue change this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {
			'chart': function(moduleValue) {
				if (this.DEBUG) console.log("Pie Chart: update from chart object");

				if (! moduleValue || ! moduleValue.value) return;

				this._convertChartToData(moduleValue.get());

				// data are ready to be ploteed
				this.loadedData.resolve();
			},
			'yArray': function(moduleValue) {
				if (this.DEBUG) console.log("Pie Chart: update from array");
				this._data=moduleValue.get();
				this.loadedData.resolve();
			}
		},
		
		_convertChartToData: function(value) {
			this._data = [];
			var self=this;
			if ( ! value.data instanceof Array || ! value.data[0] || ! value.data[0].y instanceof Array) return;
			if (value.data.length>0) {
				console.log("Pie Chart module can only display the first serie of data")
			}
			var y=value.data[0].y;
			var highlight=value.data[0]._highlight;
			var infos=value.data[0].info;
			for (var i = 0; i < y.length; i++) {
				this._data[i] = {
					data: y[i]
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
			console.log(this._data);
		},

		updateOptions: function() {
			this._options = {
				grid: {
					clickable:true,
					hoverable:true
				},
				series: {
					pie: {
						show:true
					}
				}
			};


	 		var cfg = $.proxy( this.module.getConfiguration, this.module );

			this._options.test=cfg('nodeSize') || 1;

		}


	});

	return view;
});