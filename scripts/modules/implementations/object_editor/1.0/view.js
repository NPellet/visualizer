 /*
 * view.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.grid_selector == 'undefined')
	CI.Module.prototype._types.grid_selector = {};

CI.Module.prototype._types.grid_selector.View = function(module) {
	this.module = module;
}

CI.Module.prototype._types.grid_selector.View.prototype = {
	
	init: function() {	
		this.domWrapper = $('<div class="ci-display-form"></div>');
		this.module.getDomContent().html(this.domWrapper);
	
		var self = this;
	},

	inDom: function() {
		var cfg = this.module.getConfiguration();
		var fields = cfg.fields;
		//fields = fields.fields;


		var form = $("<div />");
		this.domWrapper.append(form);
		form.biForm({}, function() {

			var section = this.addSection(new BI.Forms.Section('main', {}, new BI.Title('Test')));
			var group = section.addFieldGroup(new BI.Forms.GroupFields.List('group'));

			for(var i = 0, l = fields.length; i < l; i++) {
				field = group.addField({
					type: fields[i].fieldtype,
					title: new BI.Title(fields[i].fieldlabel),
					name: "field" + i
				});
			}
		}, function() {

			var content = {};
			for(var i = 0, l = fields.length; i < l; i++) {
				content["field" + i] = [ 'sdfsdf' ];
			}

			var fill = {
				sections: {
					main: [{
						groups: {
							group: [
								content
							]
						}
					}]
				}
			}

			this.fillJson(fill);
			
		});


	},
	
	onResize: function() {
	},
	
	blank: function() {
		//this.domTable.empty();
		this.table = null;
	},

	update2: {

		source: function(moduleValue) {
			
			
		}
	},

	getDom: function() {
		return this.dom;
	},
	
	typeToScreen: {
		
	
	}
}

 
