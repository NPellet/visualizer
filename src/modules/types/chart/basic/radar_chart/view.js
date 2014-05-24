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
<<<<<<< HEAD

			var data=this._convertChartToData(this.value);

=======

			var data=this._convertChartToData(this.value);

>>>>>>> upstream/gh-pages

			this.createChart(this.value);

			this._radar.parse(data,"json");

			var self=this;
<<<<<<< HEAD
			this._radar.attachEvent("onMouseMove", function (id, ev, trg)
			{
				data.forEach(function(entry) 
				{

					if(entry.id == id)
					{
						var obj = entry;
						console.log(obj);
						if(ev.toElement.outerHTML[ev.toElement.outerHTML.length -3] == 'd')
					{
						self.module.controller.elementHover(obj._highlight[0]);
					}
					else
					{
						self.module.controller.elementHover(obj._highlight[ev.toElement.outerHTML[ev.toElement.outerHTML.length -3]]);
					}}


=======
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


>>>>>>> upstream/gh-pages
				});		
				return true;

			}); 
<<<<<<< HEAD
			this._radar.attachEvent("onMouseOut", function (id, ev, trg){
=======
			self._radar.attachEvent("onMouseOut", function (id, ev, trg){
>>>>>>> upstream/gh-pages
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
<<<<<<< HEAD
						var index = "serie"+i;
						data[j][index] = value.data[i].y[j];
						console.log(value.data[i]._highlight[j]);
						if (value.data[i]._highlight && value.data[i]._highlight[j]) {
							data[j]['_highlight'].push({name: index, _highlight: value.data[i]._highlight[j]});
=======
						data[j][value.data[i].name] = value.data[i].y[j];
						if (value.data[i]._highlight && value.data[i]._highlight[j]) {
							data[j]['_highlight'].push({name: value.data[i].name, _highlight: value.data[i]._highlight[j]});
>>>>>>> upstream/gh-pages
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
					value: "#serie0#",
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
<<<<<<< HEAD
								value: "#serie"+i+"#",
=======
								value: "#"+chart.data[i].name+"#",
>>>>>>> upstream/gh-pages
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
<<<<<<< HEAD

			case 'pie':
				var options = {
					view: cfg('pie'),
					container: this._id,
					radius: 250,
					value: "#serie0#",
=======
				
			case 'pie':
				var options = {
					// view: cfg('pie'),
					container: self._id,
					value: "#"+chart.data[0].name+"#",
>>>>>>> upstream/gh-pages
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