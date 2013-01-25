 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.webservice_search == 'undefined')
	CI.Module.prototype._types.webservice_search = {};

CI.Module.prototype._types.webservice_search.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.webservice_search.Controller.prototype = {
	
	
	init: function() { },
	
	onClick: function() {
		
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
				
		for(var i = 0; i < actions.length; i++) {
			if(actions[i].event == "onSelect") {
				(function(element, actionName, jpath) {
					CI.API.setSharedVarFromJPath(actionName, element, jpath);
				}) (element, actions[i].name, actions[i].jpath)
			}
		}
		
	},

	configurationSend: {

		events: {

			onSelect: {
				label: 'Select a line',
				description: 'Click on a line to select it'
			},
			
			onHover: {
				label: 'Hovers a line',
				description: 'Pass the mouse over a line to select it'
			}
		},
		
		rels: {
			'element': {
				label: 'Row',
				description: 'Returns the selected row in the list'
			}
		}
	},
	
	
	
	configurationReceive: {

	},
	
	moduleInformations: {
		moduleName: 'Webservice Search'
	},

	
	doConfiguration: function(section) {
		
		
		var groupfield = new BI.Forms.GroupFields.List('cfg');
		section.addFieldGroup(groupfield);
		var field = groupfield.addField({
			type: 'Text',
			name: 'url'
		});
		field.setTitle(new BI.Title('Search URL'));


		var field = groupfield.addField({
			type: 'Text',
			name: 'jpatharray'
		});
		field.setTitle(new BI.Title('JPath to array'));



		var groupfield = new BI.Forms.GroupFields.Table('cols');

		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'coltitle'
		});
		field.setTitle(new BI.Title('Columns title'));
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'coljpath'
		});
		
		field.setTitle(new BI.Title('Value jPath'));
		


		return true;
	},
	
	doFillConfiguration: function() {
		
		var cols = this.module.getConfiguration().colsjPaths;
		var titles = [];
		var jpaths = [];
		for(var i in cols) {
			titles.push(i);
			jpaths.push(cols[i].jpath);
		}


		return {	

			groups: {
				
				cfg: [{
					url: [this.module.getConfiguration().url],
					jpatharray: [this.module.getConfiguration().jpatharray]
				}],

				cols: [{
					coltitle: titles,
					coljpath: jpaths
				}]
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		var group = confSection[0].cols[0];
		var cols = {};
		for(var i = 0; i < group.length; i++)
			cols[group[i].coltitle] = { jpath: group[i].coljpath };
		this.module.getConfiguration().colsjPaths = cols;
		this.module.getConfiguration().url = confSection[0].cfg[0].url[0];
		this.module.getConfiguration().jpatharray = confSection[0].cfg[0].jpatharray[0];
	},

	"export": function() {
	}
}
