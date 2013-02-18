 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.button_url == 'undefined')
	CI.Module.prototype._types.button_url = {};

CI.Module.prototype._types.button_url.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.button_url.View.prototype = {
	
	init: function() {	
		var self = this;
		this.dom = $('<div></div>');
		var button = new BI.Buttons.Button(this.module.getConfiguration().label || '', function() {
			self.module.controller.onClick();
		}, { color: self.module.getConfiguration().color || 'Grey'});

		this.module.getDomContent().html(this.dom);
		this.dom.html(button.render());
		this.button = button;
	},


	inDom: function() {},
	
	onResize: function() {
	},
	
	blank: function() {
		this.domTable.empty();
		this.table = null;
	},

	update2: {
		url: function(val) {
			if(val)
				this.url = val;
		},

		color: function(val) {
			if(val)
				this.button.setColor(val);
		},

		label: function(val) {
			if(val)
				this.button.setValue(val);
		}
	},

	buildElement: function(source, arrayToPush, jpaths, colorJPath) {
	
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	}
}

 
