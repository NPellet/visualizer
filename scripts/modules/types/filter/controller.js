define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		configurationSend: {
			events: {
				filter: {
					label: 'Filtering is done'
				}
			},
			
			rels: {
				
			}
		},
		
		
		configurationReceive: {

			"variable": {
				type: [],
				label: 'Any variable',
				description: ''
			}

		},
		
		
		moduleInformations: {
			moduleName: 'Filter'
		},
		

		configurationStructure: function(section) {
			
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
										title: 'Field name'
									},

									label: {
										type: 'text',
										title: 'Field label'
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

			varsout: function( cfg ) {
				if( ! ( cfg instanceof Array ) ) {
					return [];
				}
				return cfg;
			},

			script: function( cfg ) {
				if( ! cfg ) {
					return '';
				}

				return cfg;
			},

			filters: function( cfg ) {
				if( ! ( cfg instanceof Array ) ) {
					return [];
				}
				return cfg;
			}
		},

		configAliases: {
			filters: [ 'sections', 'filterElement' ],
			script: [ 'groups', 'cfg', 0, 'script', 0 ]//,
		//	varsout: [ 'groups', 'varsout', 0 ],
		}
	});

	return controller;
});