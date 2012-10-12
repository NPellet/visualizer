 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.chemexper_exactmass == 'undefined')
	CI.Module.prototype._types.chemexper_exactmass = {};

CI.Module.prototype._types.chemexper_exactmass.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.chemexper_exactmass.Controller.prototype = {
	
	
	init: function() {
		
		var module = this.module;
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
		
		var callbacks = [];
		for(var i = 0; i < actions.length; i++) {
			if(actions[i].event == 'onQueryReturn') {
				var jpath = actions[i].jpath;
				var name = actions[i].name;
				callbacks.push(function(data) {
					
					var toSend = CI.Types.getValueFromJPath(jpath, data);
					
					if(toSend != null)
						CI.API.setSharedVar(name, toSend);
				});
			}
		}
		
		this.module.model._callbacks = callbacks;
		
	},
	
	configurationSend: {
		
		events: {
			onQueryReturn: {
				label: 'when a query returns',
				description: 'Triggers the event when the query is back'
			}
		},
		
		rels: {
			'list': {
				label: 'List of chemicals',
				description: 'Return the list of the chemicals'
			},
			
			'best': {
				label: 'Best match',
				description: 'Returns the best chemical'
			}
			
		
		}
	},
	
	configurationReceive: {
		
		exactmass: {
			type: 'number',
			label: 'Exact mass',
			description: 'The exact mass of a chemical to look for'
		},
		
		majormass: {
			type: 'number',
			label: 'Major mass',
			description: 'The major mass of the product (accouting for isotopes)'
		}
	},
	
	
	moduleInformations: {
		moduleName: 'Chemexper mass lookup'
	}
}
