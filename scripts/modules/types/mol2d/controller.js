define(function(['modules/defaultcontroller'], function(Default)) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		configurationSend: {
		},
		
		hoverEvent: function(data) {

		},
		
		configurationReceive: {
			"mol2d": {
				type: ['mol2d', 'molfile2D'],
				label: 'A mol 2D file',
				description: ''
			},

			atomLabels: {
				type: ['array'],
				label: 'An array containing the labels of the atoms',
				description: ''	
			}
		},
		
		moduleInformations: {
			moduleName: 'Mol 2D'
		},
		
		doConfiguration: function(section) {
			
			return;
	/*
			var groupfield = new BI.Forms.GroupFields.List('module');
			section.addFieldGroup(groupfield);
			
			var field = groupfield.addField({
				type: 'Combo',
				name: 'charttype'
			});
			field.implementation.setOptions([{ title: "Horizontal Bar Chart", key: "hbarchart"}, { title: "Vertical Bar Chart", key: "vbarchart"}, { title: "Line chart", key: "linechart"}]);
			field.setTitle(new BI.Title('Chart type'));
		

			var field = groupfield.addField({
				type: 'Text',
				name: 'linewidth'
			});
			field.setTitle(new BI.Title('Line width'));
			
			
			var field = groupfield.addField({
				type: 'Text',
				name: 'pointsize'
			});
			field.setTitle(new BI.Title('Point size'));
			

			
			var field = groupfield.addField({
				type: 'Checkbox',
				name: 'legend'
			});
			field.setTitle(new BI.Title('Legend'));
			field.implementation.setOptions({"display": "Display"});
			return true;
			*/
		},
		
		doFillConfiguration: function() {
		
		 	return {};

			/*
			var cfg = this.module.getConfiguration();
			var linewidth = cfg.linewidth || 0;
			var charttype = cfg.charttype || "linechart";
			var pointsize = cfg.pointsize || 7;
			var displayLegend = cfg.legend ? ['display'] : ''

			return {
				module: [{
					linewidth: [linewidth],
					pointsize: [pointsize],
					charttype: [charttype],
					legend: [displayLegend]
				}]
			}*/
		},
		
		
		doSaveConfiguration: function(confSection) {
			/*
			var group = confSection[0].module[0];
			
			var linewidth = group.linewidth[0];
			var charttype = group.charttype[0];
			var pointsize = group.pointsize[0];
			var legend = !!group.legend[0][0];

			this.module.definition.configuration = {
				linewidth: linewidth,
				pointsize: pointsize,
				charttype: charttype,
				legend: legend
			};*/

			
		}


	});

	return controller;
});