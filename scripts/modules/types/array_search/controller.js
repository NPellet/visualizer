define(['modules/defaultcontroller', 'util/datatraversing', 'libs/formcreator/formcreator'], function(Default, Traversing, FormCreator) {
	
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
				groups: { },
				sections: {
					searchFields: FormCreator.makeConfig( all_jpaths, true ),
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