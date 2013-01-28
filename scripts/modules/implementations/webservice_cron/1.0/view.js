 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.webservice_cron == 'undefined')
	CI.Module.prototype._types.webservice_cron = {};

CI.Module.prototype._types.webservice_cron.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.webservice_cron.View.prototype = {
	
	init: function() {	
		var self = this;
		this.dom = $('<div></div>');
		var button = new BI.Buttons.Button(this.module.getConfiguration().label || '', function() {
			self.buttonUpdate();
			self.module.controller.onClick();
		});

		this.module.getDomContent().html(this.dom);
		this.dom.html(button.render());
		this.button = button;
	},

	buttonUpdate: function(el) {

		if(el == true) {
			this.currentNumber++;
		} else if(el == false) {

		} else {
			this.currentNumber = 0;
		}

		var total = this.module.getConfiguration().variables.length;

		if(this.currentNumber == total) {
			var d = new Date();
			var str = d.getHours() + ":" + d.getMinutes();
		} else
			var str = this.currentNumber + " / " + total;

		this.button.getDom().html((this.module.getConfiguration().label || '') + " (" + str + ")");
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

 
