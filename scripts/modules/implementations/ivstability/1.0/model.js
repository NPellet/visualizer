 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
if(typeof CI.Module.prototype._types.ivstability == 'undefined')
	CI.Module.prototype._types.ivstability = {};
CI.Module.prototype._types.ivstability.Model = function(module) { }
$.extend(CI.Module.prototype._types.ivstability.Model.prototype, CI.Module.prototype._impl.model);
$.extend(CI.Module.prototype._types.ivstability.Model.prototype, {

	getValue: function() {
		return this.dataValue;
	},
	
	getjPath: function(rel, accepts) {
		
		return [];
	}
});
