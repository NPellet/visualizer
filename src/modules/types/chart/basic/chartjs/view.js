define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util','lib/chartjs/Chart'], function(Default, Traversing, API, Util) {

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
			this._id = Util.getNextUniqueId();
			if (! this.dom) {
				
				this.dom = $('<canvas  style="height: 100% !important;width: 100% !important;"id="' + this._id + '"></canvas>');
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
			//var cfg = $.proxy( this.module.getConfiguration, this.module );
			//axis = undefined;
			//this.updateOptions(cfg, axis);

		},


		inDom: function() {
		
			if (this.DEBUG) console.log("Stack Chart: inDom");
			
		},

		onResize: function() {

			if (this.DEBUG) console.log("Stack Chart: onResize");

			var self=this;
			
			this.loadedData.done(function() {
			var radarChartData = {
			labels : ["","","","","","",""],
			datasets : [
				{
					fillColor : "rgba(220,220,220,0.5)",
					strokeColor : "rgba(220,220,220,1)",
					pointColor : "rgba(220,220,220,1)",
					pointStrokeColor : "#fff",
					data : [65,59,90,81,56,55,40]
				},
				{
					fillColor : "rgba(151,187,205,0.5)",
					strokeColor : "rgba(151,187,205,1)",
					pointColor : "rgba(151,187,205,1)",
					pointStrokeColor : "#fff",
					data : [28,48,40,19,96,27,100]
				}
			]
			
		}
		
		//var v = document.getElementById(self._id).getContext("2d");
		//att = v.canvas.attributes;
		//console.log(att[0]);
			new Chart(document.getElementById(self._id).getContext("2d")).Radar(radarChartData);
			})
				
				
		},

		/* When a value change this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {
		
			'chart': function(moduleValue) {
			var self=this;
			
			if (this.DEBUG) console.log("stack Chart: update from chart object");

				if (! moduleValue || ! moduleValue.value) return;
				this._convertChartToData(moduleValue.get().data);
				this.loadedData.resolve();	
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


	});

	return view;
});