/**
 *	Intended behaviour: new element in the couch must trigger a first level variable change.
 *	In the words, the trigger is that the whole array has changed.
 *
 *	On a new revision, only the child element must be changed. triggerChange must be somehow used.
 *	Perhaps a deep extend is needed. Otherwise we need to copy the listeners and callbacks !
 */


define(['components/pouchdb/dist/pouchdb-nightly'], function( PouchDB ) {
	
	var constructor = {},
		allPouch = {};


	constructor.makePouch = function( name ) {

		if( ! name ) {
			return;
		}

		if( allPouch[ name ] ) {
			return allPouch[ name ];
		}

		var optionsFromCouch = {
			continuous: true,
			onChange: function() { // Each change
				console.log(arguments);
				// Ok that's the really tricky part.
				// We need to update all variables that have been
			},

			complete: function() { // All changes done

			}
		}

		var optionsFromPouch = {

			continuous: false // Event based trigger
		}

		allPouch[ name ] = new PouchDB( name );

	}

	constructor.replicate = function( name, couchURL ) {

		if( ! constructor.getPouch( name ) ) {
			return;
		}

//		PouchDB.replicate( couchURL, allPouch[ name ] );
		//PouchDB.replicate( allPouch[ name ], couchURL );
	}

	constructor.pouchToVar = function( dbname, id, callback ) {

		var pouch;

		if( ! ( pouch = constructor.getPouch( dbname ) ) ) {
			return;
		}

		if( id ) {
			pouch.get( id, function(err, doc) { 

				if( ! doc ) {
					doc = new PouchObject( { } );
				} else {
					doc = new PouchObject( doc, true );
				}

				callback( doc );

			} );/*.then( function( pouchDoc ) {
				console.log( pouchDoc );
				callback( pouchDoc );
			} )*/
		} else {

			pouch.allDocs( { include_docs: true }, function( err, allDocs ) {
			
				if( allDocs === null ) {
					allDocs = new PouchArray();
				} else {
					var all = [], pouchObject;
					for( var i = 0, l = allDocs.rows.length ; i < l ; i ++ ) {
						pouchObject = new PouchObject( allDocs.rows[ i ].doc, true );
						pouchObject.setPouch( dbname );
						all.push( pouchObject );
					}
					allDocs = new PouchArray( all );
				}
				callback( allDocs );
			});
	
		}
	}

	constructor.getPouch = function( name ) {

		return allPouch[ name ];
	}

	return constructor;

});