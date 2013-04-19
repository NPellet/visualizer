 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Copyright 2013 Luc Patiny - luc.patiny@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
if(typeof CI.Module.prototype._types.dendrogram == 'undefined')
	CI.Module.prototype._types.dendrogram = {};
CI.Module.prototype._types.dendrogram.Model = function(module) { }
$.extend(CI.Module.prototype._types.dendrogram.Model.prototype, CI.Module.prototype._impl.model);
$.extend(CI.Module.prototype._types.dendrogram.Model.prototype, {

	
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
		// ????????? Why it does not work ????
		// this.module.getDataFromRel('tree'));
		var value=this.module.view._value || {};
		while (value.children && value.children.length>0) {
			value=value.children[0];
		}
		var jpaths = [];
		CI.DataType.getJPathsFromElement(value, jpaths);
			
		switch(rel) {
			case 'node':
				return jpaths;
			break;

			default:
				return false;
			break;
		}
	}

});
