 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.chemexper_exactmass == 'undefined')
	CI.Module.prototype._types.chemexper_exactmass = {};

CI.Module.prototype._types.chemexper_exactmass.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.chemexper_exactmass.View.prototype = {
	
	init: function() {	
		var html = [];
		html.push('<div></div>');
		this.dom = $(html.join(''));
		this.module.getDomContent().html(this.dom);
	},
	
	onResize: function() {
		
	
	},
	
	update: function(state) {
		var mode = state.mode == 'exactmass' ? 'exact mass' : 'major mass';
		
		if(state.looking) {
			this.getDom().html('Currently looking up ' + mode + ' ' + state.mass);
		} else {
			this.getDom().html('Found ' + state.number + ' different results for ' + mode + ' ' + state.mass);
		}
	},
	
	
	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
		
	}
}
