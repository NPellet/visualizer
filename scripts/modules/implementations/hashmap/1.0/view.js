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
			var type = CI.DataType.getType(moduleValue);
			CI.DataType.toScreen(moduleValue, this.module).done(function(html) {
				view.dom.append(html);
				CI.Util.ResolveDOMDeferred();
			});
		}
	},
	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {

		'object': function(deferred, moduleValue) {
			var cfg = this.module.getConfiguration().keys;
			var html = '';
			
			for(var i in cfg) {

				CI.DataType.getValueFromJPath(moduleValue, cfg[i]).done(function(html2) {
					
					html += '<tr><td>' + i + '</td><td>' + html2 + '</td></tr>';
				});


			}
			console.log(html);
			this.dom.html(html);
		}
	}
}

 