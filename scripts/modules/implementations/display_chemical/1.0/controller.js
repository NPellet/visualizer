 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.display_chemical == 'undefined')
	CI.Module.prototype._types.display_chemical = {};

CI.Module.prototype._types.display_chemical.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.display_chemical.Controller.prototype = {
	
	
	init: function() {
		
		var module = this.module;
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
				
		if(typeof actions.onEntryHover !== "undefined")
			console.log('Implement it =)');
		// do something if you want !
	},
	
	configurationSend: {

		events: {
			onEntryHover: {
				label: 'mouse over a chemical',
				description: 'When the mouses moves over a new entry in the array'
			}
		},
		
		rels: {
			'listelement': {
				label: 'Element in the list',
				description: 'Returns the selected element in the list'
			}
		}
	
	},
	
	configurationReceive: {
		chemical: {
			type: 'chemical',
			label: 'Chemical',
			description: 'Receives any chemical'
		}
	},
	
	
	moduleInformations: {
		moduleName: 'Chemical displayer'
	}
}
