define(['modules/defaultcontroller', 'util/datatraversing', 'util/api'], function(Default, Traversing, API) {
	
	function controller() {

	};

	controller.prototype = $.extend(true, {}, Default, {

		lineHover: function(element) {
			
			var actions;
			
			this.setVarFromEvent('onHover', element);
			if(element._highlight)
				API.highlight(element._highlight, 1);
		},

		lineOut: function(element) {
			if(element._highlight)
				API.highlight(element._highlight, 0);
		},

		lineClick: function(element, row) {
			this.setVarFromEvent('onSelect', element);
		},

		onToggleOn: function(element, row) {
			if(!row.selected)
				return;
			this.sendAction('element', element, 'onToggleOn');
			this.setVarFromEvent('onToggleOn', element);
		},


		onToggleOff: function(element, row) {

			if(row.selected)
				return;

			this.sendAction('element', element, 'onToggleOff');
			this.setVarFromEvent('onToggleOff', element);
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
			rel: {'row': 'Row Source'}
		},

		actionsReceive: {
			'addRow': 'Add a new row',
			'removeRow': 'Remove a row'
		},
		
		
		doConfiguration: function(section) {
			
			var data = Traversing.getValueIfNeeded(this.module.data),
				jpaths = [];
			
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
								name: 'toggle',
								title: 'Line toggling',
								options: [{key: "0", title: "No"}, {key: "single", title:"Single row"}, {key: "multiple", title:"Multiple rows"}]
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
								options: { 'allow': 'Allow searching'}
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
								title: 'Columns title'
							},

							{
								type: 'Combo',
								name: 'coljpath',
								title: 'jPath',
								options: jpaths
							}

						]
					}
				}
			}		
		},
		
		doFillConfiguration: function() {

			var cfg = this.module.getConfiguration();
			var cols = cfg.colsjPaths;
			
			var titles = [];
			var jpaths = [];

			for(var i in cols) {
				titles.push(i);
				jpaths.push(cols[i].jpath);
			}

			return {	

				groups: {
					gencfg: [{
						nblines: [cfg.nbLines || 20],
						toggle: [cfg.toggle],
						colorjpath: [cfg.colorjPath || ''],
						displaySearch: [[cfg.displaySearch ? 'allow' : '']]
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

	return controller;
});