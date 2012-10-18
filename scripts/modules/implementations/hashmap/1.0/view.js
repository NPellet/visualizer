 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

 
if(typeof CI.Module.prototype._types.hashmap == 'undefined')
	CI.Module.prototype._types.hashmap = {};

CI.Module.prototype._types.hashmap.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.hashmap.View.prototype = {
	
	init: function() {	
		this.dom = $('<table></table>');
		this.module.getDomContent().html(this.dom);
	},
	
	inDom: function() {},

	onResize: function() {
		
	},
	
	update2: {
		'hashmap': function(moduleValue) {
			
			if(moduleValue === undefined)
				return;
			var view = this;
			view.dom.html('');

			var cfg = this.module.getConfiguration().keys;
			var html = '';
			for(var i in cfg) {
				CI.DataType.asyncToScreenHtml(moduleValue, view.module, cfg[i]).done(function(html2) {
					html += '<tr><td>' + i + '</td><td>' + html2 + '</td></tr>';	
				})
			}

			this.dom.html(html);
			CI.Util.ResolveDOMDeferred(this.dom);
			/*
			var type = CI.DataType.getType(moduleValue);
			CI.DataType.toScreen(moduleValue, this.module).done(function(html) {
				view.dom.append(html);
				CI.Util.ResolveDOMDeferred();
			});*/
		}
	},
	getDom: function() {
		return this.dom;
	},

	typeToScreen: {}
}

 