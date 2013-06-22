 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.grid == 'undefined')
	CI.Module.prototype._types.grid = {};

CI.Module.prototype._types.grid.Controller = function(module) {}

$.extend(CI.Module.prototype._types.grid.Controller.prototype, CI.Module.prototype._impl.controller, {
	
	lineHover: function(element) {
		
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onHover") {
				CI.API.blankSharedVar(actions[i].name);
				CI.API.setSharedVarFromJPath(actions[i].name, element, actions[i].jpath);
			}
		
		CI.RepoHighlight.set(element._highlight, 1);
	},

	lineOut: function(element) {
		CI.RepoHighlight.set(element._highlight, 0);
	},

	lineClick: function(element, row) {
		this.sendAction('element', element, 'onSelect');
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
		for(var i = 0; i < actions.length; i++) {
			if(actions[i].event == "onSelect") {
				(function(element, actionName, jpath) {
					CI.API.blankSharedVar(actionName);
					CI.API.setSharedVarFromJPath(actionName, element, jpath);
				}) (element, actions[i].name, actions[i].jpath)
			}
		}
	},

	onToggleOn: function(element, row) {
		if(!row.selected)
			return;
		this.sendAction('element', element, 'onToggleOn');
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
		for(var i = 0; i < actions.length; i++) {
			if(actions[i].event == "onToggleOn") {
				(function(element, actionName, jpath) {
					CI.API.blankSharedVar(actionName);
					CI.API.setSharedVarFromJPath(actionName, element, jpath);
				}) (element, actions[i].name, actions[i].jpath)
			}
		}
	},


	onToggleOff: function(element, row) {

		if(row.selected)
			return;

		this.sendAction('element', element, 'onToggleOff');

		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
		for(var i = 0; i < actions.length; i++) {
			if(actions[i].event == "onToggleOff") {
				(function(element, actionName, jpath) {
					CI.API.blankSharedVar(actionName);
					CI.API.setSharedVarFromJPath(actionName, element, jpath);
				}) (element, actions[i].name, actions[i].jpath)
			}
		}
	},
	
	configurationSend: {

		events: {

			onSelect: {
				label: 'Select a line',
				description: 'Click on a line to select it'
			},
			
			onHover: {
				label: 'Hovers a line',
				description: 'Pass the mouse over a line to select it'
			},

			onToggleOn: {
				label: 'On Toggle On',
				description: ''
			},

			onToggleOff: {
				label: 'On Toggle Off',
				description: ''
			}
		},
		
		rels: {
			'element': {
				label: 'Row',
				description: 'Returns the selected row in the list'
			}
		}
		
	},
	
	configurationReceive: {
		list: {
			type: ["array", "arrayXY"],
			label: 'List',
			description: 'Any list of displayable element'
		}		
	},
	
	moduleInformations: {
		moduleName: 'Table'
	},
	
	actions: {
		rel: {'element': 'Row'}
	},

	actionsReceive: {
		'addRow': 'Add a new row',
		'removeRow': 'Remove a row'
	},
	
	
	doConfiguration: function(section) {
		
		
		var groupfield = new BI.Forms.GroupFields.List('gencfg');
		
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'nblines'
		});
		field.setTitle(new BI.Title('Lines per page'));
		


		var field = groupfield.addField({
			type: 'Combo',
			name: 'toggle'
		});
		field.setTitle(new BI.Title('Line toggling'));
		field.implementation.setOptions([{key: "0", title: "No"}, {key: "single", title:"Single row"}, {key: "multiple", title:"Multiple rows"}]);

		var data = CI.DataType.getValueIfNeeded(this.module.data);
		var jpaths = [];
		
		if(CI.DataType.getType(data) == 'array') 
			CI.DataType.getJPathsFromElement(data[0], jpaths);
		else if(CI.DataType.getType(data) == 'arrayXY')
			CI.DataType.getJPathsFromElement(data, jpaths);

		var field = groupfield.addField({
			type: 'Combo',
			name: 'colorjpath'
		});
		
		field.setTitle(new BI.Title('Color jPath'));
		field.implementation.setOptions(jpaths);
		

		var field = groupfield.addField({
			type: 'Checkbox',
			name: 'displaySearch'
		});
		field.implementation.setOptions({ 'allow': 'Allow searching'});
		field.setTitle(new BI.Title('Searching'));
		
		var groupfield = new BI.Forms.GroupFields.Table('cols');

		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'coltitle'
		});
		field.setTitle(new BI.Title('Columns title'));
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'coljpath'
		});
		field.implementation.setOptions(jpaths);
		field.setTitle(new BI.Title('Value jPath'));
		
		return true;
	},
	
	doFillConfiguration: function() {
		var cfg = this.module.getConfiguration();
		var cols = cfg.colsjPaths;
		var nblines = cfg.nbLines || 20;
		var colorjPath = cfg.colorjPath || '';
		var search = cfg.displaySearch || false;
		var toggle = cfg.toggle;

		var titles = [];
		var jpaths = [];

		for(var i in cols) {
			titles.push(i);
			jpaths.push(cols[i].jpath);
		}

		return {	

			groups: {
				gencfg: [{
					nblines: [nblines],
					toggle: [toggle],
					colorjpath: [colorjPath],
					displaySearch: [[search ? 'allow' : '']]
				}],
				
				cols: [{
					coltitle: titles,
					coljpath: jpaths
				}]
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		var group = confSection[0].cols[0];
		var cols = {};
		for(var i = 0; i < group.length; i++)
			cols[group[i].coltitle] = { jpath: group[i].coljpath };
		this.module.getConfiguration().colsjPaths = cols;
		this.module.getConfiguration().nbLines = confSection[0].gencfg[0].nblines[0];
		this.module.getConfiguration().toggle = confSection[0].gencfg[0].toggle[0];
		this.module.getConfiguration().colorjPath = confSection[0].gencfg[0].colorjpath[0];
		this.module.getConfiguration().displaySearch = !!confSection[0].gencfg[0].displaySearch[0][0];
	},

	"export": function() {
		return this.module.view.table.exportToTabDelimited();
	}
});
