define(['modules/defaultcontroller', 'util/datatraversing'], function(Default, Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		initimpl: function() {

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
								default: 5,
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
			'colnumber': [ 'groups', 'group', 0, 'colnumber', 0 ],
			'colorjpath': [ 'groups', 'group', 0, 'colorjPath', 0 ],
			'valjpath': [ 'groups', 'group', 0, 'valjPath', 0 ]
		}

	});

 	return controller;
});