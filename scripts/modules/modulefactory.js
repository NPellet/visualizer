define(['jquery', 'modules/module'], function($, Module) {

	var incrementalId = 0;

	var modules = [ ],
		definitions = [ ];

	var allTypes = { };
	var modulesLoading = 0;
	var modulesDeferred = $.Deferred(),
		url;

	function parseModules( moduleslist ) {
		var defs = [];

		for( var i in moduleslist ) {
				
			if( Array.isArray( moduleslist[ i ] ) ) { // Is an array of module (a folder)
				// Actually we do nothing cause we don't NEED to.
			}

			if( typeof moduleslist[ i ] == 'string' ) { // Is a module or a folder

				url = moduleslist[ i ];
				moduleslist[ i ] = [];
				defs.push( getModulesFromURL( url, moduleslist[ i ] ) );
			}
		}

		return $.when.apply( $, defs )
	}

	function getModulesFromURL( url, root ) {

		var def = $.Deferred( );
		modulesLoading++;
		$.getJSON( url, { }, function( modulesList ) {

 			parseModules( modulesList ).then( function() {
 				$.extend( true, root, modulesList );	
 				modulesLoading--;
				def.resolve();
 			} );
		} );

		return def.promise();
	}

	return {
		getTypes: function() {
			return modulesDeferred;
		},

		setModules: function( list ) {

			var i = 0,
				l,
				defs = [];

			if( ! ( list instanceof Array ) ) {
				list = [ list ];
			}

			l = list.length;

			for( ; i < l ; i ++ ) {

				defs.push( getModulesFromURL( list[ i ], allTypes ) );
			}

			$.when.apply( $, defs ).then( function() {
				modulesDeferred.resolve( allTypes );
			});
		},

		newModule: function(definition) {

			var module = new Module( definition );
			module.setId( ++ incrementalId );
			modules.push( module );
			definitions.push( definition );

			return module;
		},

		/**
		 * Removes a module.
		 *
		 * @param {Module} Module object to remove
		 */
		removeModule: function( module ) {

			modules.splice( modules.indexOf( module ), 1 );
			definitions.splice( definitions.indexOf( module.definition ), 1 );
			
		},

		empty: function() {
			definitions = [];
			modules = [];
		},

		getModules: function() {
			return modules;
		},

		getDefinitions: function() {
			return definitions;
		}
	}
});
