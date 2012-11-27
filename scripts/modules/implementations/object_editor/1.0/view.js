 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.grid_selector == 'undefined')
	CI.Module.prototype._types.grid_selector = {};

CI.Module.prototype._types.grid_selector.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.grid_selector.View.prototype = {
	
	init: function() {	
		this.domWrapper = $('<div class="ci-display-form"></div>');
		this.module.getDomContent().html(this.domWrapper);
	
		var self = this;
	},

	inDom: function() {},
	
	onResize: function() {
	},
	
	blank: function() {
		//this.domTable.empty();
		this.table = null;
	},

	update2: {

		source: function(moduleValue) {
			
			
		}
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	
	}
}

 
