define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util','lib/dhtmlxchart/dhtmlxchart'], function(Default, Traversing, API, Util) {

	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		DEBUG: true,

		init: function() {
			
			if (this.DEBUG) console.log("Radar Chart: init");
			if (this.dom) {
				// in the dom exists and the preferences has been changed we need to clean the canvas
				this.dom.empty();

			}
			// When we change configuration the method init is called again. Also the case when we change completely of view
			if (! this.dom) {
				this._id = Util.getNextUniqueId();
				this.dom = $('<div style="height: 100%; width: 100%" id="' + this._id + '"></div>');
				this.module.getDomContent().html(this.dom);
			}


			// Adding a deferred allows to wait to get actually the data before we draw the chart
			// we decided here to plot the chart in the "onResize" event
			this.loadedData=$.Deferred();

			if (this.DEBUG) console.log("Radar Chart: ID: "+this._id);

			this._data=[];	// the data that will be sent to FLOT
		},


		inDom: function() {
			if (this.DEBUG) console.log("Radar Chart: inDom");
		},

		onResize: function() {
			if (this.DEBUG) console.log("Radar Chart: onResize");

			var self=this;

			this.loadedData.done(function() {
				self._radar.parse(self._data,"json");
			});



		},

		/* When a value change this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {

			'chart': function(moduleValue) {
			var self=this;
			if (this.DEBUG) console.log("Radar Chart: update from chart object");

				if (! moduleValue || ! moduleValue.value) return;
				this._convertChartToData(moduleValue.get());

				this.updateChart(moduleValue.get());
				
				this.loadedData.resolve();
			},


		},



		_convertChartToData: function(value) {
			var self=this;
			
			if ( ! value ||  ! value.data instanceof Array ) return;
			
			for (var j = 0; j < value.data[0].x.length; j++) 
			{
				self._data[j] = {};
				self._data[j]["xunit"] = value.data[0].x;
				self._data[j]['_highlight'] = [];	
				for (var i = 0; i < value.data.length; i++) 
				{
					self._data[j][value.data[i].name] = value.data[i].y[j];
					if (value.data[i]._highlight && value.data[i]._highlight[j]) {
						self._data[j]['_highlight'].push({name: value.data[i].name, _highlight: value.data[i]._highlight[j]});
					}
				}
					
			};
			console.log(self._data);
		},


		updateChart: function(chart) {
			console.log("Update chart");
			var cfg=$.proxy( this.module.getConfiguration, this.module );
			var self=this;
			this.dom.empty();
			switch (cfg('preference'))
			{
			case 'radar':
				var o = {
					view: "radar",
					container: self._id,
					alpha: 0.2,
					value: "#"+chart.data[0].name+"#",
					disableItems: false,
					color: chart.data[0].color,
					fill: chart.data[0].color,
					line:{
						color:chart.data[0].color,
						width:1
					},
					xAxis:{
							template:"#xunit#"
					},
					yAxis:{
							lineShape:cfg('lineshape'),
							start: cfg('start'),
							end: cfg('end'),
							step: cfg('step'),
					},
					
				};
				this._radar = new dhtmlXChart(o);
				
				var val = []
		
				for (var i = 0; i < chart.data.length; i++) {
					if(i != 0)
					{
					this._radar.addSeries({
							value: "#"+chart.data[i].name+"#",
							fill: chart.data[i].color,
							line:{
								color:chart.data[i].color,
								width:1
							},
					 
					})
					}
					val.push({text: chart.data[i].serieLabel,color: chart.data[i].color});
				}
				this._radar.define("legend",{
					width: 120,
					align: "left",
					valign: "top",
					marker:{
						type: "cube",
						width: 15
					},
					values: val
				}); 
				break;
			case 'pie':
				var o = {
				view: cfg('pie'),
				container: self._id,
				value: "#"+chart.data[0].name+"#",
				color: chart.data[0].color,
				pieInnerText: "<b>#xunit#</b>"
				
				};
				this._radar = new dhtmlXChart(o);
				
				break;
			};
			this._radar.parse(self._data,"json");
		}
	});

	return view;
});