 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.filelistupload == 'undefined')
	CI.Module.prototype._types.filelistupload = {};

CI.Module.prototype._types.filelistupload.Controller = function(module) {}

$.extend(CI.Module.prototype._types.filelistupload.Controller.prototype, CI.Module.prototype._impl.controller, {
	
	configurationSend: {

		events: {

		},
		
		rels: {
			
		}
		
	},
	
	configurationReceive: {
		filelist: {
			type: ["array"],
			label: 'List',
			description: 'A list of files'
		}		
	},
	
	
	moduleInformations: {
		moduleName: 'Upload files'
	},
	
	
	actions: {
	
	},

	actionsReceive: {
	
	},
	
	
	doConfiguration: function(section) {
		var groupfield = new BI.Forms.GroupFields.List('gen');
		section.addFieldGroup(groupfield);
		var field = groupfield.addField({
			type: 'Text',
			name: 'fileuploadurl'
		});
		field.setTitle(new BI.Title('Upload URL'));
		return true;
	},
	
	doFillConfiguration: function() {
		
		return {	

			groups: {
				gen: [{
					fileuploadurl: [this.module.getConfiguration().fileuploadurl],
				}],
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		this.module.getConfiguration().fileuploadurl = confSection[0].gen[0].fileuploadurl[0];
	},

	"export": function() {
	
	}
});
