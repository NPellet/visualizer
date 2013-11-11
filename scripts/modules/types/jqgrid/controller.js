define(['modules/defaultcontroller', 'util/datatraversing', 'util/api'], function(Default, Traversing, API) {
	
	function controller() {

	};

	controller.prototype = $.extend(true, {}, Default, {

		lineHover: function(element) {
			if( ! element ) {
				return;
			}

			this.setVarFromEvent( 'onHover', element );
			if( element._highlight !== false ) {
				API.highlight( element._highlight, 1 );
			}
		},

		lineOut: function(element) {
			
			if(element && element._highlight !== false) {
				API.highlight(element._highlight, 0);
			}
		},

		lineClick: function(element, row) {
			this.setVarFromEvent('onSelect', element);
			this.sendAction('row', element, 'onSelect');
		},

		onToggleOn: function(element, row) {
			this.sendAction('element', element, 'onToggleOn');
			this.setVarFromEvent('onToggleOn', element);
		},

		onToggleOff: function(element, row) {
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
					label: 'Row'
				},

				'table': {
					label: 'Table'
				},

				'selectedrows': {
					label: 'Selected rows'
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
			'addColumn': 'Add a new column',
			'removeColumn': 'Remove a column',
			'removeRow': 'Remove a row'
		},
		
		
		configurationStructure: function(section) {
			
			var jpaths = this.module.model.getjPath('element');

			return {
				groups: {

					group: {
						options: {
							type: 'list',
							multiple: false
						},

						fields: {

							nblines: {
								type: 'text',
								title: 'Lines per page'
							},

							toggle: {
								type: 'combo',
								title: 'Line toggling',
								options: [{key: "0", title: "No"}, {key: "single", title:"Single row"}, {key: "multiple", title:"Multiple rows"}]
							},

							colorjpath: {
								type: 'combo',
								title: 'Color jPath',
								options: jpaths
							},

							displaySearch: {
								type: 'checkbox',
								options: { 'allow': 'Allow searching' }
							},


							filterRow: {
								type: 'jscode',
							}

						}
					},

					cols: {
						options: {
							type: 'table',
							multiple: true,
							title: 'Columns'
						},

						fields: {

							name: {
								type: 'text',
								title: 'Columns title'
							},

							jpath: {
								type: 'combo',
								title: 'jPath',
								options: jpaths
							},

							number: {
								type: 'checkbox',
								title: 'Number ?',
								options: {number: 'Yes'}
							},

							editable: {
								type: 'combo',
								title: 'Editable',
								options: [{key: 'none', title: 'No'}, {key: 'text', title: 'Text'}, {key: 'checkbox', title: 'Checkbox'}, {key: 'select', title: 'Combo'}]
							},

							options: {
								type: 'text',
								title: 'Options (; separated)'
							},

							width: {
								type: 'text',
								title: 'Width'
							}
						}
					}
				}
			}		
		},
		/*
		doFillConfiguration: function() {

			var cfg = this.module.getConfiguration();
			var cols = cfg.colsjPaths;
			
			var titles = [],
				jpaths = [],
				colnumber = [],
				coleditable = [],
				coloptions = [];

			for(var i in cols) {
				titles.push(i);
				jpaths.push(cols[i].jpath);
				colnumber.push(cols[i].number ? ['number'] : []);
				coleditable.push(cols[i].editable || 'none');
				coloptions.push(cols[i].options);
			//	colwidth.push(cols[i].width);
			}

			return {	

				groups: {
					gencfg: [{
						nblines: [cfg.nbLines || 20],
						toggle: [cfg.toggle],
						colorjpath: [cfg.colorjPath || ''],
						displaySearch: [[cfg.displaySearch ? 'allow' : '']],
						filterRow: [cfg.filterRow]
					}],
					
					cols: [{
						coltitle: titles,
						coljpath: jpaths,
						number: colnumber,
						editable: coleditable,
						options: coloptions
					}]
				}
			}
		},
		
		doSaveConfiguration: function(confSection) {
			var group = confSection[0].cols[0];
			var cols = {};
			for(var i = 0; i < group.length; i++) {
				cols[group[i].coltitle] = { 
					jpath: group[i].coljpath, 
					number: group[i].number[0] == 'number', 
					editable: group[i].editable || 'none',
					options: group[i].options
				};
			}
			
			this.module.getConfiguration().colsjPaths = cols;
			this.module.getConfiguration().nbLines = confSection[0].gencfg[0].nblines[0];
			this.module.getConfiguration().toggle = confSection[0].gencfg[0].toggle[0];
			this.module.getConfiguration().colorjPath = confSection[0].gencfg[0].colorjpath[0];
			this.module.getConfiguration().displaySearch = !!confSection[0].gencfg[0].displaySearch[0][0];
			this.module.getConfiguration().filterRow = confSection[0].gencfg[0].filterRow[0];
		},
*/
		onVarReceiveChange: function(name, rel, confSection) {

			var data = API.getVar(name);
			var jpaths = [];
			if(!data)
				return;
			
			if(data.getType() == 'array') 
				Traversing.getJPathsFromElement(data[0], jpaths);
			else if(data.getType() == 'arrayXY')
				Traversing.getJPathsFromElement(data, jpaths);

			if(jpaths.length > 1)
				confSection.getGroup('cols').getField('coljpath').implementation.setOptions(jpaths);
		},

		configFunctions: {
			'displaySearch': function(cfg) { return cfg.indexOf('allow')>-1; }
		},

		configAliases: {
			'colsjPaths': [ 'groups', 'cols', 0 ],
			'nbLines': [ 'groups', 'group', 0, 'nblines', 0 ],
			'toggle': [ 'groups', 'group', 0, 'toggle', 0 ],
			'colorjPath': [ 'groups', 'group', 0, 'colorjpath', 0 ],
			'displaySearch': [ 'groups', 'group', 0, 'displaySearch', 0, 0 ],
			'filterRow': [ 'groups', 'group', 0, 'filterRow', 0 ]
		},

		"export": function() {
			return this.module.view.table.exportToTabDelimited();
		}

	});

	return controller;
});