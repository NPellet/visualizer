 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.grid_selector == 'undefined')
	CI.Module.prototype._types.grid_selector = {};

CI.Module.prototype._types.grid_selector.Model = function(module) { }

$.extend(CI.Module.prototype._types.grid_selector.Model.prototype, CI.Module.prototype._impl.model);
$.extend(CI.Module.prototype._types.grid_selector.Model.prototype, {
	
	
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
