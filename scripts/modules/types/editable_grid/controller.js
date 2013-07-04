define(['modules/defaultcontroller','util/api','util/datatraversing'], function(Default, API, Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		lineHover: function(element, row) {

			this.sendAction('row', [element, row], 'onHover');

			var actions;
			if(!(actions = this.module.definition.dataSend))	
				return;	
			for(var i = 0; i < actions.length; i++)
				if(actions[i].event == "onHover")
					CI.API.setSharedVarFromJPath(actions[i].name, element, actions[i].jpath);
			
			API.highlight(element._highlight, 1);
		},

		lineOut: function(element) {
			API.highlight(element._highlight, 0);
		},

		lineClick: function(element, row) {
			

			this.sendAction('row', [element, row], 'onSelect');


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
			moduleName: 'Editable table'
		},
		
		actions: {
			rel: {'row': 'Row Source'}
		},

		
		doConfiguration: function(section) {

			var data = Traversing.getValueIfNeeded(this.module.getDataFromRel('list'));
			var jpaths = [];
			if(Traversing.getType(data) == 'array') 
				Traversing.getJPathsFromElement(data[0], jpaths);
			else if(Traversing.getType(data) == 'arrayXY')
				Traversing.getJPathsFromElement(data, jpaths);


			return {
				groups: {
					'gencfg': {
						config: {
							type: 'list'
						},

						fields: [
							{
								type: 'Text',
								name: 'nblines',
								title: 'Lines per page'
							},

							{
								type: 'Combo',
								name: 'colorjpath',
								title: 'Color jPath',
								options: jpaths
							},

							{
								type: 'Checkbox',
								name: 'displaySearch',
								title: 'Searching',
								options: { 'allow': 'Allow searching'}
							},

							{
								type: 'JSCode',
								name: 'filterRow',
								title: 'Apply filter to row'
							}
						]
					},

					'cols': {
						config: {
							type: 'table'
						},

						fields: [

							{
								type: 'Text',
								name: 'coltitle',
								title: 'Column title'
							},

							{
								type: 'Combo',
								name: 'coljpath',
								options: jpaths,
								title: 'jPath'
							},

							{
								type: 'Combo',
								name: 'edtiable',
								title: 'Editable type',
								options: [
									{title: 'Not editable', key: 'none'},
									{title: 'Editable', key: '_none', selectable: false, folder: true, children: [
										{title: 'String', key: 'string'},
										{title: 'Checkbox', key: 'checkbox'},
										{title: 'Combo box', key: 'combo'},
										{title: 'Button', key: 'button'}
									]}
								]
							},

							{
								type: 'Text',
								name: 'coloptions',
								title: 'Options (comma separated)'
							},

							{
								type: 'Text',
								name: 'colnewjpath',
								title: 'New jPath'
							}
						]
					}
				}
			}
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
				cols[group[i].coltitle] = { jpath: group[i].coljpath, editable: ((ed == 'none' || ed == '_none') ? false : ed), colnewjpath: group[i].colnewjpath, coloptions: group[i].coloptions };
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

	});

	return controller;
});