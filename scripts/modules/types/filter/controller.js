define(['modules/defaultcontroller', 'libs/formcreator/formcreator'], function(Default, FormCreator) {
	
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
					filterElement: : FormCreator.makeConfig( )
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