 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.canvas_matrix == 'undefined')
	CI.Module.prototype._types.canvas_matrix = {};
CI.Module.prototype._types.canvas_matrix.Model = function(module) { }
$.extend(CI.Module.prototype._types.canvas_matrix.Model.prototype, CI.Module.prototype._impl.model);
$.extend(CI.Module.prototype._types.canvas_matrix.Model.prototype, {

	
	
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
		
		
		/* Triggers a module update */
		this.module.updateView();
	},
	
	getValue: function() {
		return this.dataValue;
	},
	
	
	getjPath: function(rel, accepts) {
		
		function getjPath(data) {
			
			var jpaths = [];
			CI.DataType.getJPathsFromElement(data, jpaths);
			
			return jpaths;
		}
		
		var data = this.module.getDataFromRel('matrix');
		
		if(!data)
			return;
		
		data = data.value;
		if(!data)
			return;
			
		switch(rel) {
			case 'row':
				var data = data.yLabel[0];
				return getjPath(data, accepts);
			break;
			case 'col':
				var data = data.xLabel[0];
				return getjPath(data, accepts);
			break;
			
			case 'intersect':
				var data = data.data[0][0];
				return getjPath(data, accepts);
			break;

			default:
				return false;
			break;
		}
	}
});
