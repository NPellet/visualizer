 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.ivstability == 'undefined')
	CI.Module.prototype._types.ivstability = {};

CI.Module.prototype._types.ivstability.Controller = function(module) {}

$.extend(CI.Module.prototype._types.ivstability.Controller.prototype, CI.Module.prototype._impl.controller, {
	
	configurationSend: {

		events: {
			
		},
		
		rels: {
			
		}
		
	},
	
	configurationReceive: {
		
	},
	
	actions: {
		//rel: {'addSerie': 'Add a serie', 'removeSerie': 'Remove a serie'}
	},


	actionsReceive: {
		'addSerie': 'Add a new serie',
		'removeSerie': 'Remove a serie'
	},


	moduleInformations: {
		moduleName: 'IV Stability Test'
	},
	
	doConfiguration: function(section) {

		return true;
	},
	
	doFillConfiguration: function() {


	},
		
	doSaveConfiguration: function(confSection) {	

	}
});
