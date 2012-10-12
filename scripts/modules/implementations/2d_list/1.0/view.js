 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types['2d_list'] == 'undefined')
	CI.Module.prototype._types['2d_list'] = {};

CI.Module.prototype._types['2d_list'].View = function(module) {
	this.module = module;
}

CI.Module.prototype._types['2d_list'].View.prototype = {
	
	init: function() {	
		var html = [];
		html.push('<div class="ci-displaylist-list-2d"></div>');
		this.dom = $(html.join(''));
		this.module.getDomContent().html(this.dom);
	},
	
	onResize: function() {
		
	
	},
	
	inDom: function() {},

	update2: {

		list: function(moduleValue) {

			if(moduleValue == undefined || !(moduleValue instanceof Array))
				return;

			var view = this, cfg = this.module.getConfiguration();
			var valJpath = cfg.valjpath;
			var colorJpath = cfg.colorjpath;
			var cols = cfg.colnumber || 4;
			var sizeStyle = "";
			if(cfg.width || cfg.height) {
				sizeStyle += 'style="';
				if(cfg.width)
					sizeStyle += "width: " + Math.round(100 / cols) + "%; ";
				if(cfg.height)
					sizeStyle += "height: " + cfg.height + "px; ";
				sizeStyle += '"';
			}
			CI.DataType.fetchElementIfNeeded(moduleValue).done(function(val) {
				this.list = val;
				var html = '<table cellpadding="3" cellspacing="0">';
				for(var i = 0; i < this.list.length; i++) {
					colId = i % cols;
					if(colId == 0)
						html += '<tr>';
					html += '<td ';
					html += sizeStyle;
					html += '>';
					var thehtml;
					async = CI.DataType.asyncToScreenHtml(this.list[i], view.module, valJpath);
					async.done(function(val) {
						thehtml = val;
					});
					if(!thehtml)
						thehtml = async.html;
					html += thehtml;
					//html +=  CI.DataType.toScreen(CI.DataType.getValueFromJPath(this.list[i], valJpath), this.module);
					html += '</td>';
					if(colId == cols)
						html += '</tr>';
				}
				
				if(i % cols != 0) {
					while(i % cols != 0) {
						html += '<td></td>';
						i++;
					}
					html += '</tr>';
				}
				html += '</table>';
				view.dom.html(html);
			});
			
			CI.Util.ResolveDOMDeferred(view.dom);
		}
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
		asChemical: function(chemical) {
			CI.dataType.instanciate(chemical);
			return chemical.instance.getIUPAC();
		},
		
		asString: function(val) {
			return val;
		}
		
	}
}