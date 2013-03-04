 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.button_url == 'undefined')
	CI.Module.prototype._types.button_url = {};

CI.Module.prototype._types.button_url.Controller = function(module) { }

$.extend(CI.Module.prototype._types.button_url.Controller.prototype, CI.Module.prototype._impl.controller, {
	
	onClick: function() {
		var self = this;
		var url = this.module.view.url || this.module.getConfiguration().url;

		if(url)
			document.location.href = url;

		if(this.module.getConfiguration().script)
			eval(this.module.getConfiguration().script);
	},

	configurationSend: {

		events: {

		},
		
		rels: {
			
		}		
	},
	
	configurationReceive: {
		
		label: {
			type: ["string"],
			label: 'Label',
			description: 'Label'
		},

		color: {
			type: ["string"],
			label: 'Color',
			description: 'Color'
		},


		disabled: {
			type: ["boolean", "number"],
			label: 'Disabled',
			description: 'Disabled'
		},

		url: {
			type: ["string"],
			label: 'URL',
			description: 'URL'
		}		
	},
	
	moduleInformations: {
		moduleName: 'Button to URL'
	},

	
	doConfiguration: function(section) {
		
		
		var groupfield = new BI.Forms.GroupFields.List('cfg');
		section.addFieldGroup(groupfield);
		var field = groupfield.addField({
			type: 'Text',
			name: 'label'
		});
		field.setTitle(new BI.Title('Label'));


		var field = groupfield.addField({
			type: 'Combo',
			name: 'color'
		});
		field.setTitle(new BI.Title('Color'));
		field.implementation.setOptions([
			{ title: 'Grey', key: 'grey'}, 
			{ title: 'Blue', key: 'blue'}, 
			{ title: 'Green', key: 'green'},
			{ title: 'Red', key: 'red'}
		]);

		var field = groupfield.addField({
			type: 'Checkbox',
			name: 'disabled'
		});
		field.setTitle(new BI.Title('Disabled'));
		field.implementation.setOptions({'disabled': ''});


		var field = groupfield.addField({
			type: 'Text',
			name: 'url'
		});
		field.setTitle(new BI.Title('URL'));
		

		var field = groupfield.addField({
			type: 'JSCode',
			name: 'script'
		});
		field.setTitle(new BI.Title('Script'));



		return true;
	},
	
	doFillConfiguration: function() {
		var cfg = this.module.getConfiguration();
		return {	
			groups: {
				cfg: [{
					label: [cfg.label],
					color: [cfg.color],
					disabled: [cfg.disabled ? ['disabled'] : []],
					url: [cfg.url],
					script: [cfg.script]
				}]
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		this.module.getConfiguration().label = confSection[0].cfg[0].label[0];
		this.module.getConfiguration().url = confSection[0].cfg[0].url[0];
		this.module.getConfiguration().color = confSection[0].cfg[0].color[0];
		this.module.getConfiguration().script = confSection[0].cfg[0].script[0];
		this.module.getConfiguration().disabled = confSection[0].cfg[0].disabled[0][0] == 'disabled';
	},

	"export": function() {
	}
});
