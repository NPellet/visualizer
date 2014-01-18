define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'lib/formcreator/formcreator'], function(Default, Traversing, FormCreator) {



	/**
	 * Creates a new empty controller
	 * @class Controller
	 * @name Controller
	 * @constructor
	 */
	function controller() { };

	// Extends the default properties of the default controller
	controller.prototype = $.extend( true, {}, Default );


	/*
		Information about the module
	*/
	controller.prototype.moduleInformation = {
		moduleName: 'Configured search',
		description: 'Filters an array with configured UI criterias',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'configured_search'
	};
	

	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		'array': {
			label: 'An input array', // The input array is never modified
			type: 'array'
		},

		'filteredArray': {
			label: 'Filtered array',
			type: 'array'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events
		'onSearchDone': {
			label: 'When a search is performed',
			refVariable: [ 'filteredArray' ],
			refAction: [ 'filteredArray' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'array' ];

	/*
		Received actions
		In the form of

		{
			actionRef: 'actionLabel'
		}
	*/
	controller.prototype.actionsIn = {
		
	};
	
		
	controller.prototype.configurationStructure = function(section) {
	
		var all_jpaths = [],
			arr = this.module.getDataFromRel('array');

		if( arr ) {
			arr = arr.get();
			Traversing.getJPathsFromElement( arr[ 0 ], all_jpaths );
		}

		return {
			groups: { },
			sections: {
				searchFields: FormCreator.makeConfig( all_jpaths, true ),
			}
		}
	};



	/**
	 * Called from the view when a search has been performed
	 *
	 * @param {Array} arr The ouput array
	 */
	controller.prototype.searchDone = function( arr ) {

		// Sets the variable corresponding to the onSearchDone event
		this.setVarFromEvent( 'onSearchDone', arr, 'filteredArray' );
	},

		
	controller.prototype.configFunctions =  {

		searchfields: function( cfg ) {
			if( ! ( cfg instanceof Array ) ) {
				return [];
			}
			return cfg;
		}
	},

	controller.prototype.configAliases = {
		searchfields: [ 'sections', 'searchFields' ]
	}

	return controller;
});