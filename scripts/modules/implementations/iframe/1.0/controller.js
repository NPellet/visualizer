 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.iframe == 'undefined')
	CI.Module.prototype._types.iframe = {};

CI.Module.prototype._types.iframe.Controller = function(module) {}

$.extend(CI.Module.prototype._types.iframe.Controller.prototype, CI.Module.prototype._impl.controller, {
	
	configurationSend: {

		events: {

		},
		
		rels: {
		}
		
	},
	
	configurationReceive: {
		url: {
			type: ["string"],
			label: 'URL',
			description: 'Iframe URL'
		}		
	},
	
	
	moduleInformations: {
		moduleName: 'Iframe'
	},
	
	
	
	
	doConfiguration: function(section) {
		
		return true;
	},
	
	doFillConfiguration: function() {
		
	},
	
	doSaveConfiguration: function(confSection) {
		
	},

	"export": function() {
		
	}
});
