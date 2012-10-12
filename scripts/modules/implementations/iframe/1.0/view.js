 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.iframe == 'undefined')
	CI.Module.prototype._types.iframe = {};

CI.Module.prototype._types.iframe.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.iframe.View.prototype = {
	
	init: function() {	
		this.dom = $('<iframe border="0" frameborder="none" width="100%" height="100%" />');
		this.module.getDomContent().html(this.dom);
		var self = this;
	},

	inDom: function() {

	},
	
	onResize: function(w, h) {


	},
	
	blank: function() {
		this.dom.attr('src', null);
	},

	update2: {

		url: function(moduleValue) {
			if(!moduleValue)
				return;
			
			this.dom.attr('src', moduleValue);
		}
	},

	getDom: function() {
		return this.dom;
	},	
	
	typeToScreen: {
	}
}

 