 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.webservice_search == 'undefined')
	CI.Module.prototype._types.webservice_search = {};

CI.Module.prototype._types.webservice_search.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.webservice_search.View.prototype = {
	
	init: function() {	
		var self = this;
		this.dom = $('<div></div>');
		this.search = $('<div class="Search"></div>');
		this.dom.append(this.search);
		this.module.getDomContent().html(this.dom);

		if(searchparams = this.module.getConfiguration().searchparams) {
			for(var i in searchparams)
				this.search.append('<div><label>' + searchparams[i].label + '</label><input type="text" value="' + searchparams[i].defaultvalue + '" name="' + i +'" /></div>');
			
			var url = self.module.getConfiguration().url;
			this.search.on('keyup', 'input', function() {
				var searchTerm = $(this).val();
				var searchName = $(this).attr('name');
				self.module.controller.doSearch(searchName, searchTerm);
			});
		}

		
	},

	inDom: function() {
		this.search.find('input:last').trigger('keyup');
	},
	
	onResize: function() {
	},
	
	blank: function() {
		
	},


	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	}
}

 
