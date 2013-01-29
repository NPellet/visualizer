 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.webservice_crontab == 'undefined')
	CI.Module.prototype._types.webservice_crontab = {};

CI.Module.prototype._types.webservice_crontab.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.webservice_crontab.View.prototype = {
	
	init: function() {	
		var self = this;
		this.dom = $('<div></div>');
		this.module.getDomContent().html(this.dom);
	},

	log: function(success, variable) {
		var time = new Date();
		this.dom.append('<div>[' + time.toLocaleString() + '] - ' + (success ? 'Ok' : 'Error') + '; Variable: ' + variable + '</div>')
	},

	inDom: function() {},
	
	onResize: function() {

	},
	
	blank: function() {
		this.domTable.empty();
		this.table = null;
	},

	update2: {

	},

	buildElement: function(source, arrayToPush, jpaths, colorJPath) {
	
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	}
}

 
