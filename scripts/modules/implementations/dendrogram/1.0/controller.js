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
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'colnumber'
		});
		field.setTitle(new BI.Title('Columns number'));
		
		// we look for a leave and get all the jpath from it
		var value=this.module.view._value;
		while (value.children && value.children.length>0) {
			value=value.children[0];
		}
		var jpaths = [];
		CI.DataType.getJPathsFromElement(value, jpaths);

		var field = groupfield.addField({
			type: 'Combo',
			name: 'labeljPath'
		});
		field.implementation.setOptions(jpaths);
		field.setTitle(new BI.Title('Value jPath'));
		
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'colorjPath'
		});
		//options.unshift({ title: 'None', key: 'none'});
		field.implementation.setOptions(jpaths);
		field.setTitle(new BI.Title('Color jPath'));
		
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
		
		return true;
	},
	
	doFillConfiguration: function() {
		
		var labeljPath = this.module.getConfiguration().labeljPath || "";
		var colorJpath = this.module.getConfiguration().colorjpath || "";
		var cols = this.module.getConfiguration().colnumber || 4;
		
		var nodeColor = this.module.getConfiguration().nodeColor || "";
		var nodeSize = this.module.getConfiguration().nodeSize || "";
		
		return { groups: {
				module: [{
					colnumber: [cols],
					labeljPath: [labeljPath],
					colorjPath: [colorJpath],
					nodeSize: [nodeSize],
					nodeColor: [nodeColor]
				}]
			}
		}
	},
	
	
	doSaveConfiguration: function(confSection) {
		
		var group = confSection[0].module[0];
		
		var colnumber = group.colnumber[0];
		var labeljPath = group.labeljPath[0];
		var colorjpath = group.colorjPath[0];
		var nodeColor = group.nodeColor[0];
		var nodeSize = group.nodeSize[0];
		
		this.module.definition.configuration = {
			colnumber: colnumber,
			labeljPath: labeljPath,
			colorjpath: colorjpath,
			nodeSize: nodeSize,
			nodeColor: nodeColor
		};
	}
});
