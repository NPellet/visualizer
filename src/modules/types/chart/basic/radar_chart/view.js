define(['modules/default/defaultview','src/util/datatraversing','src/util/api','src/util/util','lib/dhtmlxchart/dhtmlxchart'], function(Default, Traversing, API, Util) {

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
				this.dom = $('<div style="height: 100%;width: 100%" id="' + this._id + '"></div>');
				this.module.getDomContent().html(this.dom);
			}
			// if the dom existed there was probably a graph or when changing of view
			if (this._flot) { 
				delete this._flot;
			}

			// Adding a deferred allows to wait to get actually the data before we draw the chart
			// we decided here to plot the chart in the "onResize" event
			this.loadedData=$.Deferred();

			if (this.DEBUG) console.log("Stack Chart: ID: "+this._id);

			this._data=[];	// the data that will be sent to FLOT
			var cfg = $.proxy( this.module.getConfiguration, this.module );
			data = undefined;
			//this.updateoptions(cfg, data);



		},


		inDom: function() {

			if (this.DEBUG) console.log("Stack Chart: inDom");

		},

		onResize: function() {

			if (this.DEBUG) console.log("Stack Chart: onResize");

			var self=this;

			this.loadedData.done(function() {
			self._radar.parse(self._data,"json");
			console.log(self._data);
			/*self._radar.attachEvent("onItemclick", function (id, ev, trg){
			
			
			console.log(trg[0]);
		
			
			return true;

}); */
			});



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
				
				this.updateoptions(cfg, moduleValue.get());
				
				this._convertChartToData(moduleValue.get());
				
				this.loadedData.resolve();
			},


		},

		_convertChartToData: function(value,radar) {
			var self=this;
			
			if ( ! value.data instanceof Array || ! value ) return;
			
			for (var j = 0; j < value.axis[0].unit.length; j++) 
			{
				self._data[j] = {};
				self._data[j]["xunit"] = value.axis[0].unit[j];
				self._data[j]['_highlight'] = [];	
				for (var i = 0; i < value.data.length; i++) 
				{
					self._data[j][value.data[i].name] = value.data[i].x[j];
					self._data[j]['_highlight'].push({name: value.data[i].name, _highlight: value.data[i]._highlight[j]});
					
				}
					
			};
			console.log(self._data);
		},

		updateoptions: function(cfg, chart) {
		var self=this;
			 switch (cfg('preference'))
			{
			case 'radar':
				o = {
					view: "radar",
					container: self._id,
					alpha:0.2,
					value: "#"+chart.data[0].name+"#",
					disableItems: false,//cfg('point'),
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
			o = {
			view: cfg('pie'),
			container: self._id,
			value: "#"+chart.data[0].name+"#",
			color: chart.data[0].color,
				
			pieInnerText: "<b>#xunit#</b>"
			
			};
			this._radar = new dhtmlXChart(o);
			
			break;
			};
			
		
			
		



		},

	


	});

	return view;
});