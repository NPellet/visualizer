define(['require'], function( require ) {

	var Versioning;
	require([ 'src/util/versioning' ], function( Vers ) {
		Versioning = Vers;
	});


	var API;
	require([ 'src/util/api' ], function( A ) {
		API = A;
	});


	/* RELATED TO SCRIPTING 	*/
	var evaluatedScripts;
	function doScripts( ) {

		var data = getActionScripts( );

		if( ! data || evaluatedScripts ) {
			return;
		}

		var evaled = {},
			i = 0,
			l = data.length;

		for( ; i < l ; i ++ ) {

			eval("evaled[ [ data[ i ].groups.action[ 0 ].name[ 0 ] ] ] = function(value) { " + data[ i ].groups.action[ 0 ].script[ 0 ] + " }");
		}

		evaluatedScripts = evaled;
	}

	function getActionScripts() {

		return Versioning.getView( ).actionscripts || [ ];
	}

	function setActionScripts( form ) {
		
		evaluatedScripts = undefined;
		Versioning.getView( ).actionscripts = form; // Keeps track of the scripts in the view
		doScripts( form );
	}


	/* Action files */

	var actionsFiles;

	function setActionFiles( form ) {
		
		Versioning.getView( ).actionfiles = form;
		doFiles( );
	}

	function doFiles( ) {
		var files = Versioning.getView( ).actionfiles;
		var fileName,
			fileMode,
			actionName;

		actionsFiles = {};

		if( ! files ) {
			return;
		}

		for(var i = 0, l = files[ 0 ].groups.action[ 0 ].length; i < l ; i ++) {

			actionsFiles[ files[ 0 ].groups.action[ 0 ][ i ].name ] = actionsFiles[ files[ 0 ].groups.action[ 0 ][ i ].name ] || [];
			actionsFiles[ files[ 0 ].groups.action[ 0 ][ i ].name ].push( { file: files[ 0 ].groups.action[ 0 ][ i ].file, mode: files[ 0 ].groups.action[ 0 ][ i ].mode } );
		}
	}

	function executeActionFile( file, value ) {

		switch ( file.mode ) {

			case 'amd':

				require( [ file.file ], function( File ) {
					File( value );
				});

			break;

			case 'worker':

				var worker = new Worker( file.file );
				
				worker.postMessage( { method: 'actionValue', value: value } );

				worker.onmessage = function( event ) {
					// Do something. We need to invent an API here.

					if( ! event.data.method ) {
						return;
					}

					switch( event.data.method ) {

						case 'getVar':
							if( ! ( event.data.variables instanceof Array ) ) {
								return;
							}

							var variables = {},
								i = 0,
								l = event.data.variables.length;

							for( ; i < l ; i ++ ) {
								variables[ event.data.variables[ i ] ] = API.getVar( event.data.variables[ i ] );
							}

							worker.postMessage( { method: 'getVar', variables: variables });

						break;

						case 'setVar':

							if( ! ( event.data.variables ) ) {
								return;
							}
					
							for( var i in event.data.variables ) {
								API.setVar( i, event.data.variables[ i ] );
							}

						break;


						case 'terminate':
							worker.terminate();
						break;

						case 'sendAction':

							if( ! event.data.actionName ) {
								return;
							}

							API.executeAction( event.data.actionName, event.data.actionValue );

						break;

						case 'highlight':
							
							if( ! event.data.highlightId ) {
								return;
							}

							API.highlightId( event.data.highlightId, event.data.highlightValue || false );
							
						break;
					}
				}

			break;
		}
	}


	return {

		setScriptsFromForm: function( form ) {
			setActionScripts( form );
		},

		setFilesFromForm: function( form ) {
			setActionFiles( form );
		},

		viewHasChanged: function( view ) {
			setActionScripts( view.actionscripts );
			doFiles();
		},

		getScriptsForm: function( ) {
			return Versioning.getView().actionscripts || [];
		},

		getFilesForm: function() {
			return Versioning.getView().actionfiles || [];
		},

		execute: function( actionName, actionValue ) {

			if( evaluatedScripts[ actionName ] ) {
				evaluatedScripts[ actionName ]( actionValue );
			}

			if( actionsFiles[ actionName ] ) {

				var i = 0,
					l = actionsFiles[ actionName ].length;

				for( ; i < l ; i ++ ) {
					executeActionFile( actionsFiles[ actionName ][ i ], actionValue );
				}
			}
		}
	}

});