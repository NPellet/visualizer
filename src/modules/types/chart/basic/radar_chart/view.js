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
			axis = undefined;
			//this.updateOptions(cfg, axis);



		},


		inDom: function() {

			if (this.DEBUG) console.log("Stack Chart: inDom");

		},

		onResize: function() {

			if (this.DEBUG) console.log("Stack Chart: onResize");

			var self=this;

			this.loadedData.done(function() {

			// p = self.plot(self._id, self._data, self._options);
			console.log(self._data);
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
			var cfg = $.proxy( this.module.getConfiguration, this.module );

			if (this.DEBUG) console.log("stack Chart: update from chart object");

				if (! moduleValue || ! moduleValue.value) return;
				
				self.updateOptions(cfg, moduleValue.get());
				
				this._convertChartToData(moduleValue.get());
				
				this.loadedData.resolve();
			},


		},

		_convertChartToData: function(value,radar) {
			var self=this;
			
			if ( ! value.data instanceof Array || ! value ) return;
			
			console.log(value.axis[0].unit.length);
			for (var j = 0; j < value.axis[0].unit.length; j++) 
			{
				self._data[j] = {};
				self._data[j]["xunit"] = value.axis[0].unit[j];
					
				for (var i = 0; i < value.data.length; i++) 
				{
					self._data[j][value.data[i].info[0].name] = value.data[i].x[j]
					
				}
					
			}
		},

		updateOptions: function(cfg, chart) {
		var self=this;
			var posx = null;
			var posy = null;
			var xmin = null;
			var ymin = null;
			var xmax = null;
			var ymax = null;
			if (undefined != axis)
			{
			// posx = axis[0].type;
			// posy = axis[1].type;
			// xmax = axis[0].max;
			// ymax = axis[1].max;
			// xmin = axis[0].min;
			// ymin = axis[1].min;
			}
			//console.log(cfg('fill'));
			
			this._radar = new dhtmlXChart({
		view: "radar",
                container: self._id,
                alpha:0.2,
                fill: false,
				disableItems:cfg('point'),
		
		xAxis:{
				template:"#xunit#",
				
				// lineShape: null,
				// lineColor: null
		},
		yAxis:{
				lineShape:cfg('lineshape'),
				start: cfg('start'),
				end: cfg('end'),
				step: cfg('step'),
		}
        });
		try
		{
		for (var i = 0; i < chart.data.length; i++) 
				{
					color = "rgba("+Math.floor((Math.random()*255)+0)+","+Math.floor((Math.random()*255)+1)+","+Math.floor((Math.random()*255)+1)+","+Math.floor((Math.random()*255)+1)+")";
						this._radar.addSeries({
							value: "#"+chart.data[i].info[0].name+"#",
							color: color,
							fill: color,
							line:{
								color:color,
								width:1
							},
						 
						})
					
				}	
		}
		catch(e)
		{}
		



		},

	


	});

	return view;
});