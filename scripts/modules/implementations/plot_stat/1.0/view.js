/*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

(function() {
      google.load('visualization', '1.0', {'packages':['corechart']});
      // Set a callback to run when the Google Visualization API is loaded.
      google.setOnLoadCallback(function() {
      		console.log('Chart API ready');
      });
 })();
 
if(typeof CI.Module.prototype._types.plot_stat == 'undefined')
	CI.Module.prototype._types.plot_stat = {};

CI.Module.prototype._types.plot_stat.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.plot_stat.View.prototype = {
	
	init: function() {	
		this._chartId = BI.Util.getNextUniqueId();
		this.dom = $('<div class="ci-plot" id="' + this._chartId + '"></div>');
		this.module.getDomContent().html(this.dom);
	},
	
	inDom: function() {},

	onResize: function() {
		
		if(this.chart)
			this.drawChart();
	},
	
	update2: {
		'chart': function(moduleValue) {
			
			if(moduleValue === undefined)
				return;
			var view = this;
			var type = CI.DataType.getType(moduleValue);

			CI.DataType.toScreen(moduleValue, this.module).done(function() {
				CI.Util.ResolveDOMDeferred();
			});
		}
	},
	
	drawChart: function() {

		this.chartOptions.width = this.module.domContent.width();
		this.chartOptions.height = this.module.domContent.height();
		this.chart
			.draw(this.chartData, this.chartOptions);		

	},
	
	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {

		'chart': function(deferred, moduleValue) {

			var view = this;
			this._indexedValues = [];

			var cfg = this.module.getConfiguration();

			moduleValue = CI.DataType.getValueIfNeeded(moduleValue);	
			var data = [[ moduleValue.xAxis.label ]];
			
			if (moduleValue.serieLabels && moduleValue.serieLabels.length>0) {
				for(var i = 0, k = moduleValue.serieLabels.length; i < k; i++) {
					data[0].push(moduleValue.serieLabels[i]);
				}
			}
			
			for(var i = 0, k = moduleValue.x.length; i < k; i++) {
				data.push([moduleValue.x[i]]);
			}
			
			for(var i = 0, k = moduleValue.series.length; i < k; i++) {
				for(var j = 0, l = moduleValue.series[i].length; j < l; j++) {
					var value = moduleValue.series[i][j];		

					var m = i, n = j;
					if(value.value)
						val = value.value;
					else if(typeof val == "object")
						val = null;
					else
						val = value;

					(function(m, n) {
						CI.RepoHighlight.listen(value._highlight, function(val, commonKeys) {
							view.chart.setSelection([{row: n, column: m + 1}]);
						});
					}) (i, j);

					this._indexedValues[j + "_" + i] = {col: j, row: i, val: value};
					data[j + 1].push(val);	
				}
			}
			
			this.data = data;
			this.chartData = google.visualization.arrayToDataTable(data);
			var chartId = BI.Util.getNextUniqueId();
			view.chartOptions = {
			          title: moduleValue.title,
			          hAxis: {title: moduleValue.xAxis.label, minValue: moduleValue.xAxis.minValue, maxValue: moduleValue.xAxis.maxValue},
			          vAxis: {title: moduleValue.yAxis.label, minValue: moduleValue.yAxis.minValue, maxValue: moduleValue.yAxis.maxValue},
			          legend: cfg.legend || 'none',
			          pointSize: cfg.pointsize || 7,
			          lineWidth: cfg.linewidth || 0
			       };
		       

	
			if($("#" + this._chartId).length == 0)
					return;

			var dom = $("#" + this._chartId).get(0);
			switch(cfg.charttype) {

				case 'barchart':
				case 'vbarchart':
					view.chart = new google
						.visualization
						.ColumnChart(dom);


				break;
				case 'hbarchart':
					view.chart = new google
						.visualization
						.BarChart(dom);

				break;
				default:
				case 'linechart': 
					view.chart = new google
						.visualization
						.ScatterChart(dom);
				break;
				
			}
			

			google.visualization.events.addListener(view.chart, 'onmouseover', function(e) {
				
				var row = e.row;
				var col = e.column;
				var rowData = view._indexedValues[row + "_" + (col - 1)].val;
				view.module.controller.hoverEvent(rowData);
			});


			google.visualization.events.addListener(view.chart, 'onmouseout', function(e) {
				
				var row = e.row;
				var col = e.column;					
				var rowData = view._indexedValues[row + "_" + (col - 1)].val;

				view.module.controller.hoverOutEvent(rowData);
			});

			view.drawChart();
		}
	}
}

 
