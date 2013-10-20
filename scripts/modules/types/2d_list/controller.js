define(['modules/defaultcontroller', 'util/datatraversing'], function(Default, Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		initimpl: function() {
/*
			var actions;
			this.module.getActionForEvent('onHover', function(action) {
				this.module.getDomView().on('hover', 'table td', function() {
					var tdIndex = $(this).index();
					var trIndex = $(this).parent().index();
					var cols = module.getConfiguration().colnumber || 4;
					var elementId = trIndex * cols + tdIndex;
					if(!(moduleValue = module.getDataFromRel('list')))
						return;
					var value = Traversing.getValueIfNeeded(moduleValue);
					CI.API.setSharedVarFromJPath(actions[j].name, value[elementId], actions[j].jpath);
				});

			});
*/
		},
		
		configurationSend:  {

				events: {
					onHover: {
						label: 'Hovers a cell',
						description: ''
					}
				},
				
				rels: {
					'cell': {
						label: 'Cell',
						description: 'Returns the selected cell element'
					}
				}
		},
		
		configurationReceive: {
			list: {
				type: 'array',
				label: 'List',
				description: 'Any list of displayable element'
			
			}
		},
		
		moduleInformations: {
				moduleName: 'Grid'
		},
		
		configurationStructure: function(section) {
			
			var jpaths = this.module.model.getjPath();
			
			return {
				groups: {
					group: {
						options: {
							type: 'list'
						},

						fields: {

							colnumber: {
								type: 'text',
								title: 'Number of columns'
							},

							valjPath: {
								type: 'combo',
								title: 'Value jPath',
								options: jpaths
							},

							colorjPath: {
								type: 'combo',
								title: 'Color jPath',
								options: jpaths
							},

							width: {
								type: 'text',
								title: 'Cell width'
							},

							height: {
								type: 'text',
								title: 'Cell height'
							}
						}
					}
				}
			}
		},
			
		configAliases: {
			'colnumber': function(cfg) { return cfg.groups.group[ 0 ].colnumber[ 0 ]; },
			'colorjpath': function(cfg) { return cfg.groups.group[ 0 ].colorjPath[ 0 ]; },
			'valjpath': function(cfg) { return cfg.groups.group[ 0 ].valjPath[ 0 ]; }
		}

	});

 	return controller;
});