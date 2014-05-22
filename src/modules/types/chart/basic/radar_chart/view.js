define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util','lib/dhtmlxchart/dhtmlxchart'], function(Default, Traversing, API, Util) {

	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		DEBUG: true,



		init: function() {

			if (this.DEBUG) console.log("Radar Chart: init");

			// When we change configuration the method init is called again. Also the case when we change completely of view
			if (! this.dom) {
				this._id = Util.getNextUniqueId();
				this.dom = $('<div style="height: 100%;width: 100%" id="' + this._id + '"></div>');
				this.module.getDomContent().html(this.dom);
			}

			if (this.DEBUG) console.log("Radar Chart: ID: "+this._id);

			this._data=[];	// the data that will be represented
			var cfg = $.proxy( this.module.getConfiguration, this.module );

		},


		inDom: function() {

			if (this.DEBUG) console.log("Radar Chart: inDom");

		},

		onResize: function() {
			if (this.DEBUG) console.log("Radar Chart: onResize");
			this._redraw();
		},

		/* When a value change this method is called. It will be called for all 
		possible received variable of this module.
		It will also be called at the beginning and in this case the value is null !
		*/
		update: {
			'chart': function(moduleValue) 
			{
				if (this.DEBUG) console.log("Radar Chart: update from chart object");

				if (! moduleValue) {
					delete this.value;
				} else {
					this.value=moduleValue.get();
				}

				this._redraw();
			},


		},


		_redraw: function() {
			if (! this.value) {
				return;
			}

			if (this.dom) {
				this.dom.empty();
			}

			// Redrawing the chart requires 3 steps
			// 1. convert the data
			// 2. create an empty chart
			// 3. apply the data

			var data=this._convertChartToData(this.value);


			this.createChart(this.value);

			this._radar.parse(data,"json");

			var self=this;
			self._radar.attachEvent("onMouseMove", function (id, ev, trg)
			{
				self._data.forEach(function(entry) 
				{
				
					if(entry.id == id)
					{
						var obj = entry;
						if(ev.toElement.outerHTML[ev.toElement.outerHTML.length -3] == 'd')
					{
						self.module.controller.elementHover(obj._highlight[0]);
					}
					else
					{
						self.module.controller.elementHover(obj._highlight[ev.toElement.outerHTML[ev.toElement.outerHTML.length -3]]);
					}}


				});		
				return true;

			}); 
			self._radar.attachEvent("onMouseOut", function (id, ev, trg){
						self.module.controller.elementOut();
			}); 



		},

		_convertChartToData: function(value) {
			var data=[];
			if (value && value.data instanceof Array) {
				for (var j = 0; j < value.data[0].x.length; j++) 
				{
					data[j] = {};
					data[j]["xunit"] = value.data[0].x[j];
					data[j]['_highlight'] = [];	
					for (var i = 0; i < value.data.length; i++) 
					{
						data[j][value.data[i].name] = value.data[i].y[j];
						if (value.data[i]._highlight && value.data[i]._highlight[j]) {
							data[j]['_highlight'].push({name: value.data[i].name, _highlight: value.data[i]._highlight[j]});
						}
					}
				};
			}
			return data;
		},

		createChart: function(chart, data) {
			var self=this;
			var cfg = $.proxy( this.module.getConfiguration, this.module );
			switch (cfg('preference'))
			{
			case 'radar':
				var options = {
					view: "radar",
					container: self._id,
					alpha:0.2,
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
				this._radar = new dhtmlXChart(options);

				var val = []

				for (var i = 0; i < chart.data.length; i++) 
					{
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
				var options = {
					// view: cfg('pie'),
					container: self._id,
					value: "#"+chart.data[0].name+"#",
					color: chart.data[0].color,
					pieInnerText: "<b>#xunit#</b>"
				};
				this._radar = new dhtmlXChart(options);

				break;
			};


		},
	});
	return view;
});