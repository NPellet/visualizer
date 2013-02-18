 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.button_url == 'undefined')
	CI.Module.prototype._types.button_url = {};

CI.Module.prototype._types.button_url.Model = function(module) { }

$.extend(CI.Module.prototype._types.button_url.Model.prototype, CI.Module.prototype._impl.model);
$.extend(CI.Module.prototype._types.button_url.Model.prototype, {


		getjPath: function(rel, accepts) {
			return {};
		}

	
});
