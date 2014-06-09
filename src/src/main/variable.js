define(
[ 
	'jquery',
	'src/util/util',
	'src/main/datas',
	'src/util/versioning',
	'src/util/debug'
],
function( $, Util, Datas, Versioning, Debug ) { // Ensures Data is loaded, although not compulsory

	"use scrict";

	var data = Versioning.getData();

	var Variable = function( name ) {

		var attributes = {
			writable: true,
			enumerable: false
		};

		Object.defineProperties( this, {
			"_name": attributes,
			"_jpath": attributes,
			"_value": attributes,
			"listenedBy": attributes,
			"listeners": attributes,
		} );


		this.setName( name );
		this.listenedBy = {};
		this.listeners = [];
	}

	$.extend( true, Variable.prototype, {

		setName: function( name ) {
			this._name = name;
		},

		getName: function( ) {
			return this._name;
		},

		setjPath: function( jpath, callback ) { // Reroute variable to some other place in the data

			this._jpath = jpath;

			if( typeof this._jpath == "string" ) {
				this._jpath = this._jpath.split('.');
				this._jpath.shift();
			}

			this.triggerChange( callback );
		},


		getjPath: function( ) {
			return this._jpath;
		},

		

		createData: function( jpath, dataToCreate, callback ) {
			data.setChild( jpath.slice(0), dataToCreate );
			this.setjPath( jpath, callback );
		},

		getData: function() {
			return this._value;
		},

		setData: function( newData ) { // CAUTION. This function will overwrite source data
			data.setChild( this.getjPath(), newData );
			this._value = newData;
			newData.triggerChange();
		},

		getValue: function() {
			return this._value;
		},

		listen: function( module, callback ) {

			// If the module already listens for this variable, we should definitely not listen for it again.
			if( this.listenedBy[ module.getId() ] ) {
				Debug.warn("This module already listens the variable " + this.getName() + ". No new listener is added");
			}

			this.listenedBy[ module.getId() ] = true;
			this.listeners.push( callback );
		},

		triggerChange: function( callback ) {

			var self = this;
			data = Versioning.getData();

			if( this.rejectCurrentPromise ) {
	
				this.rejectCurrentPromise();
				this.rejectCurrentPromise = false;
			}

			this.currentPromise = new Promise( function( resolve, reject ) {

				self.rejectCurrentPromise = reject;
				var _resolve = resolve;
				
				data.getChild( self._jpath.slice( 0 ), true ).then( function( value ) {

					if( callback ) {

						new Promise( function( resolve ) {

							callback( value, resolve );	

						} ).then( function( value ) {

							self._value = value;
							_resolve( value );	

						} );
						
					} else {

						
						self._value = value;
						_resolve( value );	
					}

					
				} );	
			} );

			for( var i = 0, l = self.listeners.length ; i < l ; i ++ ) {

				self.listeners[ i ].call( self, self );
			}
		},

		onReady: function() {
			return this.currentPromise;
		}
	});

	return Variable;
});