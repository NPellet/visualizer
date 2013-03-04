 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.plot == 'undefined')
	CI.Module.prototype._types.plot = {};

CI.Module.prototype._types.plot.Controller = function(module) {}

$.extend(CI.Module.prototype._types.plot.Controller.prototype, CI.Module.prototype._impl.controller, {
	
	configurationSend: {

		events: {
			
		},
		
		rels: {
			
		}
		
	},
	
	configurationReceive: {
		"plotdata": {
			type: ['object'],
			label: 'The plot data',
			description: ''
		},

		"serie": {
			type: ['object'],
			label: 'A serie',
			description: ''
		}
	},
	
	actions: {
		rel: {'addSerie': 'Add a serie', 'removeSerie': 'Remove a serie'}
	},

	moduleInformations: {
		moduleName: 'Chart (Norman)'
	},
	
	doConfiguration: function(section) {
		
		return true;
	},
	
	doFillConfiguration: function() {
		return {}
	},
	
	
	doSaveConfiguration: function(confSection) {	
	}
});
