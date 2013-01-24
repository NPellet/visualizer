 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.object_editor == 'undefined')
	CI.Module.prototype._types.object_editor = {};

CI.Module.prototype._types.object_editor.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.object_editor.View.prototype = {
	
	init: function() {	
		this.domWrapper = $('<div class="ci-display-form"></div>');
		this.module.getDomContent().html(this.domWrapper);
	
		var self = this;
	},

	inDom: function() {
		var self = this;
		var cfg = this.module.getConfiguration();
		var xml = cfg.xml;

		var xmlTransl = new BI.Forms.xmlBuilder(false, {
			onFieldChange: function(elJPath, value, index) {
			
				if(self.source)
					CI.DataType.setValueFromJPath(self.source, elJPath, value);
			}
		});
		this.formBuilder = xmlTransl;

		var form = xmlTransl.build($($.parseXML(xml)).children());
		form.getTemplater().setSectionsTabLvl(10);
		var formDom = $("<div />");
		this.domWrapper.append(formDom);

		formDom.biForm(form, function() {}, function() {});
	},
	
	onResize: function() {
	},
	
	blank: function() {
		//this.domTable.empty();
		this.table = null;
	},

	update2: {
		source: function(moduleValue) {
			if(!moduleValue)
				return;

			this.source = moduleValue;
			var fields = this.formBuilder.getFieldsByJPath();
			for(var jpath in fields)
				CI.DataType.getValueFromJPath(moduleValue, jpath).done(function(val) {
					fields[jpath].implementation.setValue(0, val);
				});
		}
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	
	}
}

 
