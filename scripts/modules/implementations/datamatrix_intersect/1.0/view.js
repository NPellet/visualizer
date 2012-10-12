 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.datamatrix_intersect == 'undefined')
	CI.Module.prototype._types.datamatrix_intersect = {};

CI.Module.prototype._types.datamatrix_intersect.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.datamatrix_intersect.View.prototype = {
	
	init: function() {	
		this.dom = $("<div />").appendTo(this.module.getDomContent());
	},
	
	onResize: function() {
		
	},
	
	update: function() {
		
		html = [];
		var moduleValue = this.module.getValue();
		
		for(var i in moduleValue) {
			
			html.push('<table class="ci-intersect ci-intersect-' + i + '">');
			
			html.push('<tr><th colspan="2">');
			html.push(this.getLabel(i));
			html.push('</th></tr>');
			
			if(typeof moduleValue[i] == 'object')
				for(var j in moduleValue[i]) {
					html.push('<tr><td class="ci-label">');
					html.push(this.getLabel(j));
					html.push('</td><td>');
					html.push(CI.dataType.toScreen(moduleValue[i][j], j, this));
					html.push('</td></tr>');
				}
				
			/*
			 * Maybe this needs to be thought better
			 */
			else if(i == 'intersect') {
				html.push('<tr><td class="ci-label">');
				html.push(this.getLabel('diff'));
				html.push('</td><td>');
				html.push('</td><td>');
				html.push(CI.dataType.toScreen(moduleValue[i], 'intersect', this));
				html.push('</td></tr>');
			}
			
			html.push('</table>');
		}
		
		this.getDom().html(html.join(''));
		
		CI.Grid.checkModuleSize(this.module);
	},
	
	getDom: function() {
		return this.dom;
	},
	
	getLabel: function(key) {
		var val;
		if(typeof (val = this.module.definition.dataModule.labels[key]) !== "undefined")
			return val;
			
		return key;
	}
}
