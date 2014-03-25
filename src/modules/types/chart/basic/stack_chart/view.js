define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util','lib/flot/jquery.flot'], function(Default, Traversing, API, Util) {

	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		DEBUG: true,



		init: function() {

			if (this.DEBUG) console.log("Stack Chart: init");
			if (this.dom) {
				// in the dom exists and the preferences has been changed we need to clean the canvas
				this.dom.empty();

			}
			// When we change configuration the method init is called again. Also the case when we change completely of view
			if (! this.dom) {
				this._id = Util.getNextUniqueId();
				this.dom = $('<p id="choices" style="float:right; width:15%;"><br></p><div style="height: 100%;width: 80%" id="' + this._id + '"></div>');
				this.module.getDomContent().html(this.dom);
			}


			
			if (this._flot) { // if the dom existed there was probably a graph or when changing of view
				delete this._flot;
			}

			// Adding a deferred allows to wait to get actually the data before we draw the chart
			// we decided here to plot the chart in the "onResize" event
			this.loadedData=$.Deferred();

			if (this.DEBUG) console.log("Stack Chart: ID: "+this._id);

			this._data=[];	// the data that will be sent to FLOT
			var cfg = $.proxy( this.module.getConfiguration, this.module );
			axis = undefined;
			this.updateOptions(cfg, axis);

		},


		inDom: function() {
		
			if (this.DEBUG) console.log("Stack Chart: inDom");
			
		},

		onResize: function() {

			if (this.DEBUG) console.log("Stack Chart: onResize");

			var self=this;
			
			this.loadedData.done(function() {
			self.plot(self._id, self._data, self._options);
			
		var i = 0;
		$.each(self._data, function(key, val) {
			val.color = i;
			++i;
		});

		
		
		var choiceContainer = $("#choices");
		choiceContainer.empty();
		
			$.each(self._data, function(key, val) {
			choiceContainer.append("<br/><input type='checkbox' name='" + key +
				"' checked='checked' id='id" + key + "'></input>" +
				"<label for='id" + key + "'>"
				+ val.label + "</label>");
		});
			
			choiceContainer.find("input").bind("click",function (event, pos, item){
		//event.preventDefault();
		self.plotAccordingToChoices(choiceContainer);
		});
		
			})
				
				
		},

		/* When a value change this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {
		
			'chart': function(moduleValue) {
			var self=this;
			var cfg = $.proxy( this.module.getConfiguration, this.module );
			
			if (this.DEBUG) console.log("stack Chart: update from chart object");

				if (! moduleValue || ! moduleValue.value) return;
				
				
				var axis = moduleValue.get().axis;
				
				self.updateOptions(cfg, axis);
				this._convertChartToData(moduleValue.get().data);
				this.loadedData.resolve();
				
				
			/*else
			{
			
				this.loadedData.done(this.plot(self._id, self._data, self._options))
			} */
				
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
			point = {
			
			}
			s = [];
				for (var i = 0; i < y.length; i++) 
				{
				
				if(! x[i]) s.push({0:i,1:y[i],_highlight:highlight[i]});
				else s.push( {0:x[i],1:y[i],_highlight:highlight[i]});
				}
				this._data[j] = {
						data: s,
						info: null,
						label: null
					}
					
						Traversing.getValueFromJPath(info[0],"element.name").done(function(elVal) {
							self._data[j].label=elVal;
							self._data[j].info=value[j].info
						}); 
			}
			
		},

		updateOptions: function(cfg, axis) {
			var posx = null;
			var posy = null;
			var xmin = null;
			var ymin = null;
			var xmax = null;
			var ymax = null;
			var xunit = null;
			var yunit = null;
			if (undefined != axis)
			{
			posx = axis[0].type;
			posy = axis[1].type;
			xmax = axis[0].max;
			ymax = axis[1].max;
			xmin = axis[0].min;
			ymin = axis[1].min;
			if(axis[0].unit instanceof Array)
			{
			u = [];
			for(i=0;i<axis[0].unit.length;i++)
			{
			u.push([i,axis[0].unit[i]]);
			}
			xunit = u;
			console.log(xunit);
			}
			if(axis[1].unit instanceof Array)
			{
			u = [];
			for(i=0;i<axis[1].unit.length;i++)
			{
			u.push([i,axis[1].unit[i]]);
			}
			yunit = u;
			}
			}
			var steps= false;
			var bars= false;
			var lines = false;
			var stack = cfg('stack');
			var barWidth = cfg('barWidth');
		
			switch (cfg('preference'))
				{
				  case 'Lines With Steps': steps = true;
							lines = true;
							break;
				  case 'Bars': bars = true;
							break;
				  case 'Lines': lines = true;
							break;
				  
				}
					
			this._options = {

				xaxis: {
				show: true,
				position: posx,
				min: xmin,
				max: xmax,
				ticks: xunit
				},
				yaxis: {
				position: posy,
				min: ymin,
				max: ymax,
				ticks: yunit
				},
				grid: {

					clickable:true,
					hoverable:true
				},
				series: {
				stack: stack,
					
					lines: { show: lines, fill: cfg('fill'), steps: steps},
					bars: { show: bars, barWidth: barWidth }

				}

			};


	 		

		},
		
		plot: function(id,data,options) {
		var self=this;
		
		var self=this;
		
				self._plot=$.plot("#"+id, data, options);
				$("#"+id).bind("plotclick", function (event, pos, item) {

				event.preventDefault();
				    if (item) {
				      	console.log("Y:"+item.datapoint[1]);
			

				    }
				});
				$("#"+id).bind("plothover", function (event, pos, item) {
				event.preventDefault();
				    if (item) {
				    	self.module.controller.elementHover(self._data[item.seriesIndex].data[item.dataIndex]);
				    } else {
				    	self.module.controller.elementOut();
				    }
				});
				
				for (var i=0; i<data.length; i++) {
					
					for (var j=0; j<data[i].data.length; j++) {
					var currentDataPoint=data[i].data[j];
					API.listenHighlight( data[i].data[j], function( onOff, key ) {

						
						
						if (onOff) {
						
						
							self._plot.highlight(0, currentDataPoint);
						
							
						} else {
						
							self._plot.unhighlight(0, currentDataPoint);
						
						}
					});
					}
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