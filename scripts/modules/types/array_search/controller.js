define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		configurationSend: {
			events: {
				filter: {
					label: 'A search has been performed'
				}
			},
			
			rels: {
				
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
	
		configurationStructure: function(section) {

			var all_jpaths = [],
				arr = this.module.getDataFromRel('array');

			Traversing.getJPathsFromElement( arr, all_jpaths );

			return {

				groups: {
					cfg: {
						options: {
							type: 'list'
						},

						fields: {

							script: {
								type: 'jscode',
								title: 'Filtering script'
							}
						}
					}/*,

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
					filterElement: {

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
										title: 'Search label',
										options: all_jpaths
									},

									type: {
										type: 'combo',
										title: 'Field type',
										options: [
											{ title: 'Text', key: 'text' },
											{ title: 'Combo', key: 'combo' },
											{ title: 'Slider', key: 'slider' }
										],

										displaySource:  {
											'text': 'text',
											'combo': 'combo',
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

			filters: function( cfg ) {
				if( ! ( cfg instanceof Array ) ) {
					return [];
				}
				return cfg;
			}
		},

		configAliases: {
			filters: [ 'sections', 'filterElement' ]
		}
	});

	return controller;
});