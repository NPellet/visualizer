define(['modules/defaultcontroller', 'util/datatraversing'], function(Default, Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		configurationSend: {
			events: {
				onSearchDone: {
					label: 'A search has been performed'
				}
			},
			
			rels: {
				'array' : { label: 'Array after search' }
			}
		},
		
		
		configurationReceive: {

			array : {
				type: [ 'array' ],
				label: 'An array of data',
				description: ''
			}
		},
		
		moduleInformations: {
			moduleName: 'Array search'
		},
		
		searchDone: function( arr ) {

			this.setVarFromEvent( 'onSearchDone', arr, 'array' );
		},

		configurationStructure: function(section) {

			var all_jpaths = [],
				arr = this.module.getDataFromRel('array');

			Traversing.getJPathsFromElement( arr[ 0 ], all_jpaths );

			return {

				groups: {
					/*,

					varsout: {
						options: {
							type: 'table',
							multiple: true
						},

						fields: {

							varoutname: {
								type: 'text',
								title: 'Variable name'
							}
						}
					}*/
				},

				sections: {
					searchFields: {

						options: {
							multiple: true,
							title: "Filtering field"
						},

						groups: {
							general: {
								options: {
									type: 'list'
								},

								fields: {


									name: {
										type: 'text',
										title: 'Search name'
									},

									label: {
										type: 'text',
										title: 'Search label'
									},

									searchOnField: {
										type: 'combo',
										multiple: true,
										title: 'Search fields',
										options: all_jpaths
									},


									operator: {
										type: 'combo',
										multiple: true,
										title: 'Operator',
										options: [
											{ title: '=', key: '=' },
											{ title: '!=', key: '!=' },
											{ title: '>', key: '>' },
											{ title: '<', key: '<' },
											{ title: 'between', key: 'btw' }
										]
									},

									type: {
										type: 'combo',
										title: 'Field type',
										options: [
											{ title: 'Text', key: 'text' },
											{ title: 'Combo', key: 'combo' },
											{ title: 'Slider', key: 'slider' },
											{ title: 'Checkbox', key: 'checkbox' }
										],

										displaySource:  {
											'text': 'text',
											'combo': 'combo',
											'checkbox': 'checkbox',
											'slider': 'slider',
										}
									}
								}
							},


							slider: {

								options: {
									type: 'list',
									displayTarget: [ 'slider' ]
								},

								fields: {

									start: {
										type: 'text',
										title: 'Start'
									},

									end: {
										type: 'text',
										title: 'End'
									},

									step: {
										type: 'text',
										title: 'Step'
									}
								}
							},

							options: {
								options: {
									type: 'table',
									multiple: true,
									displayTarget: [ 'combo', 'checkbox' ]
								},

								fields: {

									label: {
										type: 'text',
										title: 'Label'
									},

									value: {
										type: 'text',
										title: 'Value'
									}
								}
							}
						}
					}
				}
			}
		},
		
		configFunctions: {

			searchfields: function( cfg ) {
				if( ! ( cfg instanceof Array ) ) {
					return [];
				}
				return cfg;
			}
		},

		configAliases: {
			searchfields: [ 'sections', 'searchFields' ]
		}
	});

	return controller;
});