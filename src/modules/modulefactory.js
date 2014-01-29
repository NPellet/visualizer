define(['jquery', 'modules/module'], function($, Module) {

	var incrementalId = 0;

	var modules = [ ],
		definitions = [ ];

	var allTypes = { };
	var modulesLoading = 0;
	var modulesDeferred = [],
		url,
		allModules;


	function getSubFoldersFrom( folder ) {

		return $.getJSON( folder , {}).pipe( function( data ) {
			return getModules( data );
		});
	}

	function getModules( folderInfo ) {

		var defs = [];

		for( var i in folderInfo.folders ) {

			( function( j ) {

				if( typeof folderInfo.folders[ j ] == "object" ) {
					var folder = folderInfo.folders[ j ];
					delete folderInfo.folders[ j ];
					folderInfo.folders[ folder.name || j ] = folder;	

				} else {
					defs.push( getSubFoldersFrom( folderInfo.folders[ j ] + "folder.json" ).done( function( folder ) {
						delete folderInfo.folders[ j ];
						folderInfo.folders[ folder.name ] = folder;	
					} ) );
				}
				
			}) ( i );
		}

		return $.when.apply( $, defs ).pipe( function() {
			return folderInfo;			
		});
	}

	return {
		getTypes: function() {

			return $.when.apply( $, modulesDeferred ).pipe( function() {
				console.log( allModules );
				return allModules;
			});
		},

		setModules: function( list ) {

			var i = 0,
				l,
				folders = [];

			if( ! ( list instanceof Array ) ) {
				
				allModules = list;
				return;
			}

			l = list.length;
			var finalList = {};

			for( ; i < l ; i ++ ) {

				if( typeof list[ i ] == "string" ) { // url

					( function( j ) {

						getSubFoldersFrom( list[ j ] ).then( function( data ) {
							
							$.extend( true, finalList, data );
							
						} );

					} ) ( i );

					
				} else { // It's a folder type structure
console.log( list[ i ].folders );
					getModules( list[ i ] ).then( function( data ) {
						console.log( data );
						$.extend( true, finalList,  data);	
					} );
					
				}
			}
			
			allModules = finalList;
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
