 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Copyright 2013 Luc Patiny - luc.patiny@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.dendrogram == 'undefined')
	CI.Module.prototype._types.dendrogram = {};

CI.Module.prototype._types.dendrogram.Controller = function(module) { }

$.extend(CI.Module.prototype._types.dendrogram.Controller.prototype, CI.Module.prototype._impl.controller, {
	
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
		dendrogram: {
			type: ['tree'],
			label: 'A hierarchical tree',
			description: ''
		}
	},
	
	moduleInformations: {
		moduleName: 'Dendrogram'
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
			{title: 'Image', key: 'image'}
		]);

		var field = groupfield.addField({
			type: 'Text',
			name: 'labelSize'
		});
		field.setTitle(new BI.Title('Label size'));

		
		var field = groupfield.addField({
			type: 'Color',
			name: 'labelColor'
		});
		field.setTitle(new BI.Title('Label color'));

/*
		var field = groupfield.addField({
			type: 'Combo',
			name: 'labelSizejPath'
		});
		field.implementation.setOptions(jpaths);
		field.setTitle(new BI.Title('Label size jPath'));
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'labelColorjPath'
		});
		field.implementation.setOptions(jpaths);
		field.setTitle(new BI.Title('Label color jPath'));
*/

		
		var field = groupfield.addField({
			type: 'Text',
			name: 'nodeSize'
		});
		field.setTitle(new BI.Title('Node size'));
		
		var field = groupfield.addField({
			type: 'Color',
			name: 'nodeColor'
		});
		field.setTitle(new BI.Title('Node color'));

/*
		var field = groupfield.addField({
			type: 'Combo',
			name: 'nodeSizejPath'
		});
		field.implementation.setOptions(jpaths);
		field.setTitle(new BI.Title('Node size jPath'));
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'nodeColorjPath'
		});
		field.implementation.setOptions(jpaths);
		field.setTitle(new BI.Title('Node color jPath'));
*/



		var field = groupfield.addField({
			type: 'Text',
			name: 'lineWidth'
		});
		field.setTitle(new BI.Title('Line width'));
		
		var field = groupfield.addField({
			type: 'Color',
			name: 'lineColor'
		});
		field.setTitle(new BI.Title('Line color'));

		
		return true;
	},
	
	doFillConfiguration: function() {
		var cfg=this.module.getConfiguration();

		var nodeType = cfg.nodeType || "circle";
	//	var labelSizejPath =cfg.labelSizejPath || "";
	//	var labelColorjPath = cfg.labelColorjPath || "";
		var labelSize = cfg.labelSize || "";
		var labelColor = cfg.labelColor || "";
	//	var nodeColorjPath = cfg.nodeColorjPath || "";
	//	var nodeSizejPath = cfg.nodeSizejPath || "";		
		var nodeColor = cfg.nodeColor || "";
		var nodeSize = cfg.nodeSize || "";
		var lineColor = cfg.lineColor || "";
		var lineWidth = cfg.lineWidth || "";

		return { 
				groups: {
				module: [{
					nodeType: [nodeType],
		//			labelSizejPath: [labelSizejPath],
		//			labelColorjPath: [labelColorjPath],
					labelSize: [labelSize],
					labelColor: [labelColor],
		//			nodeColorjPath: [nodeColorjPath],
		//			nodeSizejPath: [nodeSizejPath],
					nodeSize: [nodeSize],
					nodeColor: [nodeColor],
					lineColor: [lineColor],
					lineWidth: [lineWidth]
				}]
			}
		}
	},
	
	
	doSaveConfiguration: function(confSection) {
		
		var group = confSection[0].module[0];
		
		this.module.definition.configuration = {
			nodeType: group.nodeType[0],
		//	labelSizejPath: group.labelSizejPath[0],
		//	labelColorjPath: group.labelColorjPath[0],
			labelSize: group.labelSize[0],
			labelColor: group.labelColor[0],
		//	nodeColorjPath: group.nodeColorjPath[0],
		//	nodeSizejPath: group.nodeSizejPath[0],
			nodeSize: group.nodeSize[0],
			nodeColor: group.nodeColor[0],
			lineColor: group.lineColor[0],
			lineWidth: group.lineWidth[0]
		};
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
