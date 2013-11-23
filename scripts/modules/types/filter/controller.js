define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		configurationSend: {
			events: {
				
			},
			
			rels: {
				
			}
		},
		
		
		configurationReceive: {
			
		},
		
		
		moduleInformations: {
			moduleName: 'Filter'
		},
		

		configurationStructure: function(section) {
			
			return {
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
		
		configAliases: {
			filters: [ 'sections', 'filterElement' ],
		}
	});

	return controller;
});