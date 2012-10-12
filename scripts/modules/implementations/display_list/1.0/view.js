 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.display_list == 'undefined')
	CI.Module.prototype._types.display_list = {};

CI.Module.prototype._types.display_list.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.display_list.View.prototype = {
	
	init: function() {	
		var html = [];
		html.push('<div class="ci-displaylist-list"></div>');
		this.dom = $(html.join(''));
		this.module.getDomContent().html(this.dom);
	},
	
	onResize: function() {
		
	
	},
	
	update: function() {

		var moduleValue;
		var view = this;
		
		if(!(moduleValue = this.module.getDataFromRel('listelements').getData()))
			return;
		
		this.list = moduleValue;
		for(var i = 0; i < this.list.length; i++) {
			var div = CI.dataType.toScreen(this.list[i], this);
			this.dom.append($('<div class="ci-displaylist-element"></div>').append(div));
		}
	},
	

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
		asChemical: function(data) {
			return data.instance.valueFromjPath('entry.iupac[0].value');;
		},
		
		asString: function(val) {
			return val;
		}
		
	}
}
