 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.datamatrix_intersect == 'undefined')
	CI.Module.prototype._types.datamatrix_intersect = {};


$.extend(CI.Module.prototype._types.datamatrix_intersect.Controller, CI.Module.prototype._impl.controller, {
	
});