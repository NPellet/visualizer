 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.spectra_displayer == 'undefined')
	CI.Module.prototype._types.spectra_displayer = {};
CI.Module.prototype._types.spectra_displayer.Model = function(module) { }
$.extend(CI.Module.prototype._types.spectra_displayer.Model.prototype, CI.Module.prototype._impl.model);
$.extend(CI.Module.prototype._types.spectra_displayer.Model.prototype, {

		getValue: function() {
		return this.dataValue;
	},
	
	
	getjPath: function(rel) {
		
		var data = this.module.getDataFromRel('list');
		
		if(!data || data == null)
			return;
		data = data.getData();
		
		if(data == null)
			return;
		
		var jpath = {};
		CI.Types._getjPath(data[i], jpath);	
		return jpath;
	}
});
