define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util','lib/flot/jquery.flot','lib/flot/jquery.flot.stack'], function(Default, Traversing, API, Util) {

	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		DEBUG: true,



		init: function() {

			if (this.DEBUG) console.log("Stack Chart: init");

			// When we change configuration the method init is called again. Also the case when we change completely of view
			if (! this.dom) {
				this._id = Util.getNextUniqueId();
				this.dom = $('<p id="choices" style="float:right; width:15%;"><br></p><p id="stack" style="float:right; width:0;position: relative;top: 50px"><br></p><select id="prefs" style="float:right; width:15%;position: relative;top: 150px;left: 70px;"></select><div style="height: 100%;width: 80%" id="' + this._id + '"></div>');
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

			this.loadedData.done(this.plot(self._id, self._data, self._options))
				// insert checkboxes 
		var i = 0;
		$.each(self._data, function(key, val) {
			val.color = i;
			++i;
		});

		// insert checkboxes 
		var choiceContainer = $("#choices");
		$.each(self._data, function(key, val) {
			choiceContainer.append("<br/><input type='checkbox' name='" + key +
				"' checked='checked' id='id" + key + "'></input>" +
				"<label for='id" + key + "'>"
				+ val.label + "</label>");
		});
		
		choiceContainer.find("input").bind("click",function (event, pos, item){
		self.plotAccordingToChoices(choiceContainer);
		});
		
		var stack = $("#stack");
		var prf = $("#prefs");
		var stacked;
		prf.append("<option>Bars</option>");
		prf.append("<option selected>Lines</option>");
		prf.append("<option>Lines With Steps</option>");
		stack.append("<br/><input type='checkbox' id='withstack'></input><label for='withstack'>Stacked/Not Sacked</label>");
		stack.find("input").bind("click",function (event, pos, item){
		if (stack.find("#withstack")[0].checked) {
		stacked = true;
		}else {
		stacked = false;
		}
		self.updateOptions(prf[0].selectedOptions[0].text,stacked);
		self.plot(self._id, self._data, self._options);
		});		
		prf.bind("click",function (event, pos, item){
		
			self.updateOptions(prf[0].selectedOptions[0].text,stacked);
		    self.plot(self._id, self._data, self._options);
		});
		
		},

		/* When a value change this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {
			'chart': function(moduleValue) {
				if (this.DEBUG) console.log("stack Chart: update from chart object");

				if (! moduleValue || ! moduleValue.value) return;
				
				this.updateOptions("lines",true);
				this._convertChartToData(moduleValue.get().data);
				this.loadedData.resolve();
				
				
				// data are ready to be ploteed
			},


		},

		_convertChartToData: function(value) {

			this._data = [];
			var self=this;
			self._data = this._data;
			if ( ! value instanceof Array || ! value || ! value.x instanceof Array) return;
			
			
			
			for (var j = 0; j < value.length; j++) 
			{
			var x=value[j].x;
			var y=value[j].y;
			var highlight=value[j]._highlight;
			var info=value[j].info;
			var label;
			s = [];
				for (var i = 0; i < y.length; i++) 
				{
				if(! x[i]) s.push([i, y[i]]);
				else s.push([x[i], y[i]]);
				
			 				
				}
				
				
				
					if (highlight instanceof Array && highlight.length>j) {
						if (highlight instanceof Array) {
						
							this._data[j] = {
						data: s,
						_highlight: highlight,
						info: null,
						label: null
					}
						} else {
						this._data[j] = {
						data: s,
						_highlight: [highlight],
						info: null,
						label: null
					}
						}
					}
						Traversing.getValueFromJPath(info[0],"element.name").done(function(elVal) {
							self._data[j].label=elVal;
							self._data[j].info=value[j].info
						});
				
			}
		},

		updateOptions: function(preference, stacked) {
			var steps,bars,lines = false;
			
			switch (preference)
				{
				  case 'Lines With Steps': steps = true;
							lines = true;
							break;
				  case 'Bars': bars = true;
							break;
				  case 'Lines': lines = true;
							break;
				  default:  lines = true;
				  stacked = false
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
				stack: stacked,
					
					lines: { show: lines, fill: true, steps: steps},
					bars: { show: bars, barWidth: 0.5 }

				}

			};


	 		var cfg = $.proxy( this.module.getConfiguration, this.module );

			this._options.test=cfg('nodeSize') || 1;

		},
		plot: function(id,data,options) {
		var self=this;
				self._plot=$.plot("#"+id, data, options);

				$("#"+id).bind("plotclick", function (event, pos, item) {
				    if (item) {
				      	console.log("Y:"+item.datapoint[1]);
			

				    }
				});
				$("#"+id).bind("plothover", function (event, pos, item) {
				    if (item) {
				    	self.module.controller.elementHover(self._data[item.seriesIndex]);
				    } else {
				    	self.module.controller.elementOut();
				    }
				});

				for (var i=0; i<data.length; i++) {
					var currentDataPoint=i;
					API.listenHighlight( data[i], function( onOff, key ) {

						// we need to highlight the correct shape ...
						//console.log(onOff, key, currentDataPoint);
						if (onOff) {
							//console.log(i);
							self._plot.highlight(0, currentDataPoint);
						} else {
							self._plot.unhighlight(0, currentDataPoint);
						}
					});
				}



			},
			plotAccordingToChoices : function(choiceContainer) {
			var self=this;
			var data = [];
			choiceContainer.find("input:checked").each(function () {
				var key = $(this).attr("name");
				if (key && self._data[key]) {
					data.push(self._data[key]);
				}
			});

			if (data.length > 0) {
				this.plot(self._id, data, self._options)
			}
		}


	});

	return view;
});