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
		this.result = null;
		this.request = null;
	},
	
	doSearch: function(name, val) {

		if(!this.searchTerms)
			this.searchTerms = [];

		if(this.request)
			this.request.abort();

		var self = this;
		this.searchTerms[name] = val;
		var url = this.module.getConfiguration().url;
		for(var i in this.searchTerms) {
			url = url.replace('<' + i + '>', escape(this.searchTerms[i]));
		}

		this.request = $.getJSON(url, {}, function(data) {
			self.request = null;
			self.onSearchDone(data);
		});
	},


	onSearchDone: function(elements) {
		var self = this;
		self.result = elements;

		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;	
		for(var i = 0; i < actions.length; i++) {
			if(actions[i].event == "onSearchReturn") {
				(function(elements, actionName, jpath) {
					CI.API.setSharedVarFromJPath(actionName, elements, jpath);
				}) (elements, actions[i].name, actions[i].jpath);
			}
		}
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

/*
		var field = groupfield.addField({
			type: 'Text',
			name: 'jpatharray'
		});
		field.setTitle(new BI.Title('JPath to array'));


*/
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


		var field = groupfield.addField({
			type: 'Text',
			name: 'defaultvalue'
		});
		
		field.setTitle(new BI.Title('Default value'));
		
		return true;
	},
	
	doFillConfiguration: function() {
		
		var searchparams = this.module.getConfiguration().searchparams;
		var names = [];
		var labels = [];
		var defaultvalue = [];
		for(var i in searchparams) {
			names.push(i);
			labels.push(searchparams[i].label);
			defaultvalue.push(searchparams[i].defaultvalue || '');
		}


		return {	

			groups: {
				
				cfg: [{
					url: [this.module.getConfiguration().url]
			//		jpatharray: [this.module.getConfiguration().jpatharray]
				}],

				searchparams: [{
					name: names,
					label: labels,
					defaultvalue: defaultvalue 
				}]
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		var group = confSection[0].searchparams[0];
		var searchparams = {};
		for(var i = 0; i < group.length; i++)
			searchparams[group[i].name] = {label: group[i].label, defaultvalue: group[i].defaultvalue};
		this.module.getConfiguration().searchparams = searchparams;
		this.module.getConfiguration().url = confSection[0].cfg[0].url[0];
	//	this.module.getConfiguration().jpatharray = confSection[0].cfg[0].jpatharray[0];
	},

	"export": function() {
	}
}
