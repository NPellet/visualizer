 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
if(typeof CI.Module.prototype._types.mol2d == 'undefined')
	CI.Module.prototype._types.mol2d = {};
CI.Module.prototype._types.mol2d.Model = function(module) { }
$.extend(CI.Module.prototype._types.mol2d.Model.prototype, CI.Module.prototype._impl.model);
$.extend(CI.Module.prototype._types.mol2d.Model.prototype, {

	
	/* 
	 * This function is a handler called from any DataSource object. 
	 * Its goal is to refresh the module with the new data
	 * 
	 * To finally refresh the view, simply call this.module.updateView();
	 * or don't if for any reason it's not necessary to update the module
	 */
	/*onDataChange: function(dataName) {
		
	
		this.dataValue[dataName] = this.data[dataName].getData();
		
		var jpath;
		if(jpath = this.data[dataName].getjPath()) {
			for(var i = 0; i < this.dataValue[dataName].length; i++) {
				this.dataValue[dataName][i] = CI.Types.getValueFromJPath(jpath, this.dataValue[dataName][i]);	
			}
		}
		
		this.lastDataName = dataName;
	
		this.module.updateView();
	},
	*/

	getValue: function() {
		return this.dataValue;
	},
	
	getjPath: function(rel, accepts) {
		return [];
	}
});
