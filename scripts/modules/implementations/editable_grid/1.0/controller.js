 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.editable_grid == 'undefined')
	CI.Module.prototype._types.editable_grid = {};

CI.Module.prototype._types.editable_grid.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.editable_grid.Controller.prototype = {
	
	
	init: function() {
		
		var module = this.module;
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
	},
	
	lineHover: function(element) {
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onHover")
				CI.API.setSharedVarFromJPath(actions[i].name, element, actions[i].jpath);
		
		CI.RepoHighlight.set(element._highlight, 1);
	},

	lineOut: function(element) {
		CI.RepoHighlight.set(element._highlight, 0);
	},

	lineClick: function(element) {
		
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
				
		for(var i = 0; i < actions.length; i++) {
			if(actions[i].event == "onSelect") {
				(function(element, actionName, jpath) {
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
		moduleName: 'Editable Grid'
	},
	
	
	
	
	doConfiguration: function(section) {
		
		
		var groupfield = new BI.Forms.GroupFields.List('gencfg');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'nblines'
		});
		field.setTitle(new BI.Title('Lines per page'));
		
		var data = this.module.getDataFromRel('list');
		var jpaths = [];
		
		if(CI.DataType.getType(data) == 'array') 
			CI.DataType.getJPathsFromElement(data[0], jpaths);
		else if(CI.DataType.getType(data) == 'arrayXY')
			CI.DataType.getJPathsFromElement(data, jpaths);
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'colorjpath'
		});
		
		field.implementation.setOptions(jpaths);
		field.setTitle(new BI.Title('Color jPath'));

		var field = groupfield.addField({
			type: 'Checkbox',
			name: 'displaySearch'
		});
		field.implementation.setOptions({ 'allow': 'Allow searching'});
		field.setTitle(new BI.Title('Searching'));
		


		var field = groupfield.addField({
			type: 'JSCode',
			name: 'filterRow',
			title: new BI.Title('Apply filter to row')
		});

		/*var filters = [];
		for(var i in CI.VariableFiltersRow) {
			filters.push({title: CI.VariableFiltersRow[i].name, key: i});
		}
		field.implementation.setOptions(filters);
	*/

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
		

		var field = groupfield.addField({
			type: 'Combo',
			name: 'editable',
			title: new BI.Title('Editable Type')
		});

		field.implementation.setOptions([
			{title: 'Not editable', key: 'none'},
			{title: 'Editable', key: '_none', selectable: false, folder: true, children: [
				{title: 'String', key: 'string'},
				{title: 'Checkbox', key: 'checkbox'},
				{title: 'Combo box', key: 'combo'}
			]}
		]);


		var field = groupfield.addField({
			type: 'Text',
			name: 'coloptions'
		});
		field.setTitle(new BI.Title('Options (comma separated)'));
		

		var field = groupfield.addField({
			type: 'Text',
			name: 'colnewjpath'
		});
		field.setTitle(new BI.Title('New jPath'));



		return true;
	},
	
	doFillConfiguration: function() {
		
		var cols = this.module.getConfiguration().colsjPaths;
		var nblines = this.module.getConfiguration().nbLines || 20;
		var colorjPath = this.module.getConfiguration().colorjPath || '';
		var search = this.module.getConfiguration().displaySearch || false;
		var filterRow = this.module.getConfiguration().filterRow || '';

		
		var titles = [];
		var jpaths = [];
		var editables = [];
		var colnewjpath = [];
		var coloptions = [];

		for(var i in cols) {
			titles.push(i);
			jpaths.push(cols[i].jpath);
			editables.push(cols[i].editable);
			colnewjpath.push(cols[i].colnewjpath);
			coloptions.push(cols[i].coloptions);
		}

		return {	

			groups: {
				gencfg: [{
					nblines: [nblines],
					colorjpath: [colorjPath],
					displaySearch: [[search ? 'allow' : '']],
					filterRow: [filterRow]
				}],

				cols: [{
					coltitle: titles,
					coljpath: jpaths,
					editable: editables,
					colnewjpath: colnewjpath,
					coloptions: coloptions
				}]
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		var group = confSection[0].cols[0];
		var cols = {};
		for(var i = 0; i < group.length; i++) {
			var ed = group[i].editable;
			cols[group[i].coltitle] = { jpath: group[i].coljpath, editable: ((ed == 'none' || ed == '_none') ? false : ed), colnewjpath: group[i].colnewjpath, coloptions: group[i].coloptions };
		}
		this.module.getConfiguration().colsjPaths = cols;
		this.module.getConfiguration().nbLines = confSection[0].gencfg[0].nblines[0];
		this.module.getConfiguration().colorjPath = confSection[0].gencfg[0].colorjpath[0];
		this.module.getConfiguration().displaySearch = !!confSection[0].gencfg[0].displaySearch[0][0];
		this.module.getConfiguration().filterRow = confSection[0].gencfg[0].filterRow[0];

	},

	"export": function() {
		return this.module.view.table.exportToTabDelimited();
	}
}
