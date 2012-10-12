 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.canvas_matrix == 'undefined')
	CI.Module.prototype._types.canvas_matrix = {};

CI.Module.prototype._types.canvas_matrix.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.canvas_matrix.Controller.prototype = {
	
	
	init: function() {
		
		var module = this.module;
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
		
	
		$(this.module.getDomView()).on('mousemove', 'canvas', $.debounce(250, function(e) {
			
			var cellX = 1;
			var cellY = 1;
			
			var moduleValue;
			if(!(moduleValue = module.getDataFromRel('matrix').getData()))
				return;
			
			moduleValue = moduleValue.value;
			var xLabel = moduleValue.xLabel;
			var yLabel = moduleValue.yLabel;
			var gridData = moduleValue.data;
			
			//Positions relative to top-left of canvas
			var xpx = e.pageX - $(e.target).offset().left;
			var ypx = e.pageY - $(e.target).offset().top;
			
			//offset by the position of the grid within the canvas
			xpx += module.view.moduleCenterX * module.view.gridImage.width - $(e.target).width()/2
			ypx += module.view.moduleCenterY * module.view.gridImage.height - $(e.target).height()/2
			
			//grid coordinates
			var x = Math.floor(xpx / module.view.lastCellWidth);
			var y = Math.floor(ypx / module.view.lastCellHeight);
			if (x<0 || y<0 || x>=gridData.length || y>=gridData[0].length)
				return;
				
			var dataKeyed = gridData[x][y];
			var value = false;
			
			for(var i in actions) {
				
				var j = i;
				
				if(actions[i].event == "onPixelHover") {
					

					var hashmap = false;
					switch(actions[i].rel) {
						case 'row':
							//yLabel[y].id = x + ", " + y;
							hashmap = yLabel[y];	
						break;
						
						case 'col':
							//yLabel[x].id = x + ", " + y;
							hashmap = xLabel[x];
						break;
						
						case 'intersect':
							hashmap = false;
							value = dataKeyed;
						break;
					}
					
					(function(h, jpath, name, value, hashmap) {
						
						if(!!hashmap) {
							var data = CI.DataType.getValueFromJPath(hashmap, jpath, function(value) {
								CI.API.setSharedVar(name, value);
							});
							
						} else if(!!value)
							var data = CI.DataType.getValueFromJPath(value, jpath, function(value) {
								CI.API.setSharedVar(name, value);
							});
						
						
					}) (j, actions[j].jpath, actions[j].name, value, hashmap);
				}
			}
		}));
			
		if(actions.onPixelClick) {
		}
		var view = this.module.view;
		// do something if you want !
	},
	
	configurationSend: {

		events: {
			onPixelHover: {
				label: 'mouse hover pixel',
				description: 'When the mouses moves over a new pixel of the data matrix'
			},
			onPixelClick: {
				label: 'click on a pixel',
				description: 'When the users click on any pixel'
			},
			onPixelDblClick: {
				label: 'double click on a pixel',
				description: 'When the user double clics on any pixel'
			}
		},
		
		rels: {
			'row': {
				label: 'Row',
				description: 'Sends the information description the row'
			},
			
			'col': {
				label: 'Column',
				description: 'Sends the information description the column'
			},
			
			'intersect': {
				label: 'Intersection',
				description: 'Sends the information description the intersection where the mouse is located'
			}
		}
	},
	
	configurationReceive: {
		'matrix': {
			type: 'matrix',
			label: 'Matrix',
			description: 'Receives the matrix to display'
		}
	},
	
	moduleInformations: {
		moduleName: 'Distance matrix'
	},
	
	
	
	doConfiguration: function(section) {
		
		var groupfield = new BI.Forms.GroupFields.List('opts');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Checkbox',
			name: 'highcontrast'
		});
		field.implementation.setOptions({ 'true': 'Take data min/max as boundaries'});
		field.setTitle(new CI.Title('Contrast'));
		
		
		var groupfield = new BI.Forms.GroupFields.Table('colors');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Color',
			name: 'color'
		});
		field.setTitle(new CI.Title('Color'));
		
		return true;
	},
	
	doFillConfiguration: function() {
		
		var cols = this.module.getConfiguration().colors || [];
		var highcontrast = this.module.getConfiguration().highContrast || false;

		return {
			
			opts: [{
				highcontrast: [highcontrast ? ['true'] : []]
			}], 
			
			colors: [{
				color: cols
			}]
		}
		
	},
	
	
	doSaveConfiguration: function(confSection) {
		
		var group = confSection[0].colors[0];
		
		var colors = [];
		for(var i = 0; i < group.length; i++)
			colors.push(group[i].color);
		
		this.module.getConfiguration().colors = colors;
		this.module.getConfiguration().highContrast = confSection[0].opts[0].highcontrast[0][0];
		
		/*var coltitle = group.colnumber;
		var coljpath = group.valjPath;
		
		
		this.module.definition.configuration = {
			colnumber: colnumber,
			valjpath: valjpath,
			colorjpath: colorjpath
		};*/
	}
	

}
