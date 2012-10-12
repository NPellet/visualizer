 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.grid == 'undefined')
	CI.Module.prototype._types.grid = {};

CI.Module.prototype._types.grid.Model = function(module) { }

$.extend(CI.Module.prototype._types.grid.Model.prototype, CI.Module.prototype._impl.model);
$.extend(CI.Module.prototype._types.grid.Model.prototype, {
	
	/* 
	 * This function is a handler called from any DataSource object. 
	 * Its goal is to refresh the module with the new data
	 * 
	 * To finally refresh the view, simply call this.module.updateView();
	 * or don't if for any reason it's not necessary to update the module
	 */
	onDataChange: function(dataName) {
		
		/* Here you can transform the data coming from the DAO */
		this.dataValue[dataName] = this.data[dataName].getData();
		
		var jpath;
		if(jpath = this.data[dataName].getjPath()) {
			for(var i = 0; i < this.dataValue[dataName].length; i++) {
				this.dataValue[dataName][i] = CI.Types.getValueFromJPath(jpath, this.dataValue[dataName][i]);	
			}
		}
		/* Triggers a module update */
		this.module.updateView();
	},
	
	getValue: function() {
		return this.dataValue;
	},
	
	
	getjPath: function(rel) {
		
		function getjPath(data) {
			// It's an array of equivalent elements
			// Don't need to merge a list
			// It's like that since the data is typed and we know the structure
			var data = data[0];
			var jpaths = []; 
			CI.DataType.getJPathsFromElement(data, jpaths);
			return jpaths;
		}

		switch(rel) {
			case 'element':
				rel = 'list';
			break;
		}
		var data = this.module.getDataFromRel(rel);
		if(!data || data == null)
			return;
		//data = data.getData();
		if(data == null)
			return;
		return getjPath(data);
	}
});
