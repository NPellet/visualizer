 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.xyzoomnavigator == 'undefined')
	CI.Module.prototype._types.xyzoomnavigator = {};

CI.Module.prototype._types.xyzoomnavigator.Model = function(module) { }

$.extend(CI.Module.prototype._types.xyzoomnavigator.Model.prototype, CI.Module.prototype._impl.model);
$.extend(CI.Module.prototype._types.xyzoomnavigator.Model.prototype, {
	
	/* 
	 * This function is a handler called from any DataSource object. 
	 * Its goal is to refresh the module with the new data
	 * 
	 * To finally refresh the view, simply call this.module.updateView();
	 * or don't if for any reason it's not necessary to update the module
	 */
	
	
	getjPath: function(rel) {
		return [];
	}
});
