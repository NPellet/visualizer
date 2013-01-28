 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.webservice_search == 'undefined')
	CI.Module.prototype._types.webservice_search = {};

CI.Module.prototype._types.webservice_search.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.webservice_search.Controller.prototype = {
	
	
	init: function() { 
		this.searchTerms = {};
	},
	
	doSearch: function(name, val) {
		var self = this;
		this.searchTerms[name] = val;
		var url = this.module.getConfiguration().url;
		for(var i in this.searchTerms) {
			url = url.replace('<' + i + '>', this.searchTerms[i]);
		}

		$.getJSON(url, {}, function(data) {
			self.onSearchDone(data);
		});
	},


	onSearchDone: function(elements) {
		var self = this;
		CI.DataType.getValueFromJPath(elements, this.module.getConfiguration().jpatharray).done(function(results) {

			var actions;
			if(!(actions = self.module.definition.dataSend))	
				return;
					
			for(var i = 0; i < actions.length; i++) {
				if(actions[i].event == "onSearchReturn") {
					(function(element, actionName, jpath) {
						CI.API.setSharedVarFromJPath(actionName, element, jpath);
					}) (results, actions[i].name, '');
				}
			}

		});
	},

	configurationSend: {

		events: {

			onSearchReturn: {
				label: 'A search has been completed',
				description: ''
			}
			
		},
		
		rels: {
			'results': {
				label: 'Results',
				description: ''
			}
		}
	},
	
	configurationReceive: {

	},
	
	moduleInformations: {
		moduleName: 'Webservice Lookup'
	},

	
	doConfiguration: function(section) {
		
		
		var groupfield = new BI.Forms.GroupFields.List('cfg');
		section.addFieldGroup(groupfield);
		var field = groupfield.addField({
			type: 'Text',
			name: 'url'
		});
		field.setTitle(new BI.Title('Search URL'));


		var field = groupfield.addField({
			type: 'Text',
			name: 'jpatharray'
		});
		field.setTitle(new BI.Title('JPath to array'));



		var groupfield = new BI.Forms.GroupFields.Table('searchparams');

		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'name'
		});
		field.setTitle(new BI.Title('Term name'));
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'label'
		});
		
		field.setTitle(new BI.Title('Term label'));
		
		return true;
	},
	
	doFillConfiguration: function() {
		
		var searchparams = this.module.getConfiguration().searchparams;
		var names = [];
		var labels = [];
		for(var i in searchparams) {
			names.push(i);
			labels.push(searchparams[i]);
		}


		return {	

			groups: {
				
				cfg: [{
					url: [this.module.getConfiguration().url],
					jpatharray: [this.module.getConfiguration().jpatharray]
				}],

				searchparams: [{
					name: names,
					label: labels
				}]
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		var group = confSection[0].searchparams[0];
		var searchparams = {};
		for(var i = 0; i < group.length; i++)
			searchparams[group[i].name] = group[i].label;
		this.module.getConfiguration().searchparams = searchparams;
		this.module.getConfiguration().url = confSection[0].cfg[0].url[0];
		this.module.getConfiguration().jpatharray = confSection[0].cfg[0].jpatharray[0];
	},

	"export": function() {
	}
}
