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
			
			if(Traversing.getType(data) == 'array')  {

				Traversing.getJPathsFromElement(data[0], jpaths);

			} else if(Traversing.getType(data) == 'arrayXY') {

				Traversing.getJPathsFromElement(data, jpaths);

			}
			
			return {
				groups: {
					gencfg: {
						options: {
							type: 'list'
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
								type: 'Combo',
								title: 'Color jPath',
								options: jpaths
							},

							displaySearch: {
								type: 'Checkbox',
								options: { 'allow': 'Allow searching'}
							}
						}
					},

					'cols': {
						options: {
							type: 'table',
							multiple: true
						},

						fields: {

							coltitle: {
								type: 'Text',
								title: 'Columns title'
							},

							coljpath: {
								type: 'Combo',
								title: 'jPath',
								options: jpaths
							}
						}
					}
				}
			}		
		},
		
		

		"export": function() {
			return this.module.view.table.exportToTabDelimited();
		}

	});

	return controller;
});