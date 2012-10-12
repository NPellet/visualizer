 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
 
if(typeof CI.Module.prototype._types.display_value == 'undefined')
	CI.Module.prototype._types.display_value = {};

CI.Module.prototype._types.display_value.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.display_value.View.prototype = {
	
	init: function() {	
		var html = "";
		html += '<div></div>';
		this.dom = $(html).css('display', 'table').css('height', '100%').css('width', '100%');
		this.module.getDomContent().html(this.dom);
	
	},
	
	onResize: function() {
		
	},
	
	blank: function() {
		this.dom.empty();
	},
	
	inDom: function() {},

	update2: {

		'color': function(color) {
			if(color === undefined)
				color = "#ffffff";
			this.module.getDomContent().css('backgroundColor', color);
		},

		'value': function(moduleValue) {
			var cfg = this.module.getConfiguration(), view = this;
			if(moduleValue == undefined)
				view.fillWithVal(cfg.defaultvalue || '');
			else
				CI.DataType.toScreen(moduleValue, this.module).done(function(val) {
					view.fillWithVal(val);
				});

		}
	},
	
	fillWithVal: function(val) {
		
		var cfg = this.module.getConfiguration();
		
		var div = $("<div />").css({
			fontFamily: cfg.font || 'Arial',
			fontSize: cfg.fontsize || '10pt',
			color: cfg.frontcolor || '#000000',
			display: 'table-cell',
			'vertical-align': cfg.valign || 'top',
			textAlign: cfg.align || 'center',
			width: '100%',
			height: '100%'
		}).html(val);

		this.dom.html(div);
		CI.Util.ResolveDOMDeferred();

	},
	
	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {}
}

 