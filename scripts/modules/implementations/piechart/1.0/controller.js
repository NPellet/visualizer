 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Copyright 2013 Luc Patiny - luc.patiny@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.piechart == 'undefined')
	CI.Module.prototype._types.piechart = {};

CI.Module.prototype._types.piechart.Controller = function(module) { }

$.extend(CI.Module.prototype._types.piechart.Controller.prototype, CI.Module.prototype._impl.controller, {
	
	singleValueFields:['nodeType','nodeSize','nodeColor','labelSize','labelColor','edgeWidth','edgeColor','strokeWidth','strokeColor'],

	configurationSend: {
		events: {
			onHover: {
					label: 'Hovers a node',
					description: ''
				}
			},
			
			rels: {
				'node': {
					label: 'Node',
					description: 'Returns the selected node element'
				}
			}
	},
	
	hoverEvent: function(data) {

	},
	
	/*
		We define the information that will be received by the module.
		In a signle value module we will for example receive a value and a color
		This information will be used in the method "update2" of the view.js
	*/
	configurationReceive: {
		piechart: {
			type: ['chart'],
			label: 'A chart',
			description: ''
		}
	},
	
	moduleInformations: {
		moduleName: 'Piechart'
	},
	
	doConfiguration: function(section) {
		
		var groupfield = new BI.Forms.GroupFields.List('module');
		section.addFieldGroup(groupfield);
				
		// we look for a leave and get all the jpath from it
		var jpaths=this.getNodeJpath();
		var field = groupfield.addField({
			type: 'Combo',
			name: 'nodeType'
		});
		field.setTitle(new BI.Title('Node type'));
		field.implementation.setOptions([
			{title: 'Circle', key: 'circle'},
			{title: 'Triangle', key: 'triangle'},
			{title: 'Square', key: 'squqre'},
			{title: 'Star', key: 'star'},
			{title: 'Ellipse', key: 'ellipse'},
			{title: 'Rectangle', key: 'rectangle'},
			{title: 'Image', key: 'image'}
		]);


		var field = groupfield.addField({
			type: 'Text',
			name: 'nodeSize'
		});
		field.setTitle(new BI.Title('Default node size'));
		
		var field = groupfield.addField({
			type: 'Color',
			name: 'nodeColor'
		});
		field.setTitle(new BI.Title('Default node color'));

		var field = groupfield.addField({
			type: 'Text',
			name: 'labelSize'
		});
		field.setTitle(new BI.Title('Default label size'));

		var field = groupfield.addField({
			type: 'Color',
			name: 'labelColor'
		});
		field.setTitle(new BI.Title('Default label color'));

		var field = groupfield.addField({
			type: 'Text',
			name: 'edgeWidth'
		});
		field.setTitle(new BI.Title('Default edge width'));
		
		var field = groupfield.addField({
			type: 'Color',
			name: 'edgeColor'
		});
		field.setTitle(new BI.Title('Default edge color'));


		var field = groupfield.addField({
			type: 'Text',
			name: 'strokeWidth'
		});
		field.setTitle(new BI.Title('Background line width'));

		var field = groupfield.addField({
			type: 'Color',
			name: 'strokeColor'
		});
		field.setTitle(new BI.Title('Background line color'));


		
		return true;
	},
	
	doFillConfiguration: function() {
		var cfg=this.module.getConfiguration();

		var module={};
		for (var i=0; i<this.singleValueFields.length; i++) {
			var varName=this.singleValueFields[i];
			module[varName]=[cfg[varName] || ""];
		}

		var configuration={
			groups: {
				module: [module]
			}
		}

		return configuration;
	},
	
	
	doSaveConfiguration: function(confSection) {
		var group = confSection[0].module[0];
		this.module.definition.configuration={};

		for (var i=0; i<this.singleValueFields.length; i++) {
			var varName=this.singleValueFields[i];
			this.module.definition.configuration[varName]=group[varName][0];
		}
	},

	getNodeJpath: function() {
		var value=this.module.view._value || {};
		while (value.children && value.children.length>0) {
			value=value.children[0];
		}
		var jpaths = [];
		CI.DataType.getJPathsFromElement(value, jpaths);
		return jpaths;
	}
});
