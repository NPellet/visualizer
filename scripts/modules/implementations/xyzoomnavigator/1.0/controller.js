 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.xyzoomnavigator == 'undefined')
	CI.Module.prototype._types.xyzoomnavigator = {};

CI.Module.prototype._types.xyzoomnavigator.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.xyzoomnavigator.Controller.prototype = {
	
	
	init: function() {
		
		var module = this.module;
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
	},
	
	move: function(x,y) {
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onMove") {
				CI.API.setSharedVarFromJPath(actions[i].name, [x,y], actions[i].jpath);
			}
	},


	zoom: function(zoom) {
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onZoomChange") {
				CI.API.setSharedVarFromJPath(actions[i].name, zoom, actions[i].jpath);
			}
	},
	
	configurationSend: {

		events: {

			onMove: {
				label: 'Move',
				description: ''
			},
			
			onZoomChange: {
				label: 'Changes Zoom',
				description: ''
			}
		},
		
		rels: {
			'xycoords': {
				label: 'XY Coords',
				description: ''
			},

			'zoom': {
				label: 'Zoom',
				description: ''
			}
		}
		
	},
	
	configurationReceive: {
		zoom: {
			type: "number",
			label: 'Zoom',
			description: ''
		},

		xycoords: {
			type: "array",
			label: 'X-Y Coords',
			description: ''
		}
	},
	
	
	moduleInformations: {
		moduleName: 'Navigator'
	},
	
	
	doConfiguration: function(section) {
		
		//return true;
	},
	
	doFillConfiguration: function() {
		return {
			groups: {
			}
		};
	},
	
	doSaveConfiguration: function(confSection) {
		
	},

	"export": function() {

	}
}
