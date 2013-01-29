 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.webservice_crontab == 'undefined')
	CI.Module.prototype._types.webservice_crontab = {};

CI.Module.prototype._types.webservice_crontab.Model = function(module) { }

$.extend(CI.Module.prototype._types.webservice_crontab.Model.prototype, CI.Module.prototype._impl.model);
$.extend(CI.Module.prototype._types.webservice_crontab.Model.prototype, {


		getjPath: function(rel, accepts) {
			return {};
		}

	
});
