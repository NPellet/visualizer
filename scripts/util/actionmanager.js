define(['require'], function( require ) {

	var Versioning;
	require([ 'util/versioning' ], function( Vers ) {
		Versioning = Vers;
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

			case 'webworker':

				var worker = new Worker( file.file );
				worker.postMessage( value );
				worker.onmessage = function() {
					// Do something. We need to invent an API here.
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