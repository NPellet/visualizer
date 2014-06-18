define([ 'jquery', 'src/util/util', 'src/util/debug' ], function( $, Util, Debug ) {

	function DataObject( object, recursive, forceCopy ) {
		if (! object) {
			return;
		}

		for( var i in object ) {

			if( object.hasOwnProperty( i ) ) {

				object[ i ] = DataObject.check( object[ i ] );
				
			}
		}

		DataObject.check( object );

		return object;
	}

	DataObject.check = function( object, transformNatives ) {
	
		if (isSpecialObject(object)) {

			return object;

		} else if( object instanceof Array ) {

			object.__proto__ = DataArray.prototype;
			return object;

		} else if( object === null ) {

			return null;

		} else {
			var type = typeof object;

			if( type == "object" ) {
				object.__proto__ = DataObject.prototype;
				return object;
			}

			if( ! transformNatives ) {
				return object;
			}

			switch ( typeof object ) {

				case 'string':
					return new DataString( object );
				break;

				case 'number':
					return new DataNumber( object );
				break;
					
				case 'boolean':
					return new DataBoolean( object );
				break;
			}
		}
	};



	DataObject.recursiveTransform = function( object, transformNatives ) {
		
		object = DataObject.check(object, transformNatives);

		if( object instanceof Array ) {

			for( var i = 0, l = object.length ; i < l ; i ++ ) {
				object[ i ] = DataObject.check( object[ i ], transformNatives );
				DataObject.recursiveTransform( object[ i ], transformNatives );
			}
		} else if( object instanceof Object ) {

			for( var i in object ) {

				object[ i ] = DataObject.check( object[ i ], transformNatives );
				DataObject.recursiveTransform( object[ i ], transformNatives );
			}

		}
		
		return object;
	};


	function DataString( s ) {
		String.call(this, s);
    	this.s_ = s;
    }

	var StringProperties = ["charAt", "charCodeAt", "concat", "fromCharCode", "indexOf", "lastIndexOf", "localCompare", 
							"match", "replace", "search", "slice", "split", "substr", "substring", "toLocaleLowerCase", "toLocaleUpperCase",
							"toLowerCase", "toString", "toUpperCase", "trim", "valueOf" ];

	for( var i = 0, l = StringProperties.length ; i < l ; i ++ ) {
		( function ( j ) {
			
			DataString.prototype[ StringProperties[ j ] ] = function() {
				return String.prototype[ StringProperties[ j ] ].apply( this.s_, arguments );
			}

		} ) ( i );
	}

	DataString.prototype.getType = function() {
		return "string";
	}
	DataString.prototype.get = function() {
		return this.s_;
	}

	DataString.prototype.setValue = function( val ) {
		this.s_ = val;
	}




	function DataNumber( s ) {
		Number.call(this, s);
    	this.s_ = s;
    }

	DataNumber.prototype.getType = function() {
		return "number";
	}

	DataNumber.prototype.setValue = function( val ) {
		this.s_ = val;
	}


	DataNumber.prototype.toString = function() {
		return String(this.s_);
	}

	DataNumber.prototype.get = function() {
		return this.s_;
	}

	DataNumber.prototype.valueOf = function() {
		return this.s_;
	}

	DataNumber.prototype.toSource = function() {
		return this.s_;
	}



	function DataBoolean( s ) {
		Boolean.call(this, s);
		this.s_ = s;
	}
	
	DataBoolean.prototype = new Boolean();
	DataBoolean.prototype.getType = function() {
		return "boolean";
	}
	DataBoolean.prototype.setValue = function( val ) {
		this.s_ = val;
	}


	DataBoolean.prototype.toString = function() {
		return String(this.s_);
	}

	DataBoolean.prototype.get = function() {
		return this.s_;
	}

	DataBoolean.prototype.valueOf = function() {
		return this.s_;
	}

	DataBoolean.prototype.toSource = function() {
		return this.s_;
	}


	window.DataString = DataString;
	window.DataNumber = DataNumber;
	window.DataBoolean = DataBoolean;


	function DataArray(arr, recursive, forceCopy) {
		var newArr = [];
		if (arr) {
			if (!(arr instanceof Array))
				throw "DataArray can only be constructed from arrays";
			for (var i = 0, l = arr.length; i < l; i++) {
				if (recursive) {
					newArr[i] = DataObject.check(arr[i], recursive, forceCopy);
				} else {
					newArr[i] = arr[i];
				}
			}
		}
		newArr.__proto__ = DataArray.prototype;
		return newArr;
	}

	DataArray.prototype = Object.create(Array.prototype);
	Object.defineProperty(DataArray.prototype, "constructor", DataArray);

	window.DataObject = DataObject;
	window.DataArray = DataArray;

	var resurrectObject = {
		value: function() {
			var obj = {};
			for (var i in this) {
				if (isSpecialObject(this[i])) {
					obj[i] = this[i].resurrect();
				} else {
					obj[i] = this[i];
				}
			}
			return obj;
		}
	};

	var resurrectArray = {
		value: function() {
			var obj = [];
			for (var i = 0, l = this.length; i < l; i++) {
				if (isSpecialObject(this[i])) {
					obj[i] = this[i].resurrect();
				} else {
					obj[i] = this[i];
				}
			}
			return obj;
		}
	};

	var dataGetter = {
		value: function( prop, returnDeferred, constructor ) {

			// Looking for this[ prop ]
			if (typeof prop !== "undefined") {

				var val = this.get(); // Current value

				if (returnDeferred) { // Returns a deferred if asked

					if (typeof val[ prop ] !== "undefined") {

						if (val[prop] && val[prop].fetch) {
							return val[prop].fetch();
						} else {
							val[prop] = DataObject.check(val[prop], true);
							return $.Deferred().resolve(val[prop]);
						}
					} else if( constructor ) {

						val[ prop ] = new constructor();
						return $.Deferred().resolve(val[prop]);

					}  else {
						return $.Deferred().reject();
					}
				} else {
					
					if (typeof val[ prop ] !== "undefined") {
						val[ prop ] = DataObject.check( val[ prop ], 1 ); // Singe recursion
					}
					return val[prop];
				}
			}

			if (this.hasOwnProperty("value") && this.hasOwnProperty("type"))
				return this.value;
			return this;
		}
	};

	var dataSetter = {
		value: function(prop, value, recursive) {
			
			var valueTyped = DataObject.check( value, true ),
				type = valueTyped.getType();

			this[ prop ] = DataObject.check( this[ prop ] );

			var typeNow = this[ prop ] !== undefined && this[ prop ].getType ? this[ prop ].getType() : undefined;

			if( typeNow != type ) {

				this[ prop ] = valueTyped;
				
				return this[ prop ];
			}

			if( type == "string" || type == "number" || type == "boolean" ) {

				this[ prop ].setValue( value );
				return this[ prop ];
			}

			if( valueTyped != this[ prop ] ) {
				this[ prop ] = valueTyped;
			}


			//this[ prop ] = value;
			return this[ prop ];
		}
	};


	var dataDuplicator = {
		value: function(source) {
			return DataObject.check(this, true, true);
		}
	};

	var getChild = {
		value: function(jpath) {

			if (jpath && jpath.split) { // Old version
				jpath = jpath.split('.');
				jpath.shift();
			}

			if ( ! jpath || jpath.length === 0 ) {
				return $.Deferred().resolve( this );
			}

			var el = jpath.shift(); // Gets the current element and removes it from the array
			var self = this;

			return this.get( el, true ).pipe(function( subEl ) {

				if ( ! subEl || ( jpath.length === 0 ) ) {
					return subEl;
				}

				subEl = DataObject.check( subEl, true );
				return subEl.getChild(jpath);
			});

		}
	};




	var trace = {
		value: function( jpath, constructor ) {

			if (jpath && jpath.split) { // Old version
				jpath = jpath.split('.');
				jpath.shift();
			}

			if ( ! jpath || jpath.length === 0 ) {
				return $.Deferred().resolve(this);
			}

			var el = jpath.shift(); // Gets the current element and removes it from the array
			var self = this;

			var elementType = jpath.length == 0 ? constructor : ( typeof el == "number" ? DataArray : DataObject );

			return this.get( el, true, elementType ).pipe(function( subEl ) {


				// Perform check if anything...
				self.get()[ el ] = DataObject.check( subEl );

				if( subEl && subEl.linkToParent ) {
					subEl.linkToParent(self, el);
				}

				if (!subEl || (jpath.length === 0)) {
					return subEl;
				}

				return subEl.trace( jpath, constructor );
			});
		}
	};


	var traceSync = {
		value: function( jpath, constructor ) {

			if (jpath && jpath.split) { // Old version
				jpath = jpath.split('.');
				jpath.shift();
			}

			if ( ! jpath || jpath.length === 0 ) {
				return this;
			}

			var el = jpath.shift(); // Gets the current element and removes it from the array
			var self = this;

			var elementType = jpath.length == 0 ? constructor : ( typeof el == "number" ? DataArray : DataObject );

			var subEl = this.get( el, false, elementType );

			// Perform check if anything...
			self.get()[ el ] = DataObject.check( subEl );

			if( subEl && subEl.linkToParent ) {
				subEl.linkToParent(self, el);
			}

			if (!subEl || (jpath.length === 0)) {
				return subEl;
			}

			return subEl.traceSync( jpath, constructor );
		}
	};






					
					

	var getChildSync = {
		value: function(jpath, setParents) {

			if( ! Array.isArray( jpath ) ) {
				jpath = [ jpath ];
			}

			if (!jpath) {
				return;
			}

			var el = jpath.shift( ); // Gets the current element and removes it from the array
			var subEl = this.get( el, false );

			if( subEl === null ) {
				return;
			}

			if( jpath.length === 0 ) {
				return subEl;
			}

			if( subEl === undefined ) {
				return undefined;
			}

			return subEl.getChildSync(jpath, setParents);
		}
	};

	var linkToParent = {
		value: function(parent, name) {

			if (this.__parent) {
				return;
			}

			parent[ name ] = this;

			Object.defineProperty(this, '__parent', {value: parent, writable: false, configurable: false, enumerable: false});
			Object.defineProperty(this, '__name', {value: name, writable: false, configurable: false, enumerable: false});
		}
	};

	var setChild = {
		value: function( jpath, newValue, noMute, constructor ) {
			var self = this;

			var mute = false;
			if( noMute === undefined ) {
				mute = true;
			}

			
			var onChangeOptions = Array.prototype.slice.call( arguments, 2 );

			if( jpath && jpath.split ) { // Old version
				jpath = jpath.split('.');
				jpath.shift();
			}

			var jpathLength = jpath.length;
			var el = jpath.shift();

			if( jpathLength == 1 ) {

				return self.set( el, newValue ).triggerChange();

			} else {

			}
							

			var elementType = jpath.length == 0 ? constructor : ( typeof el == "number" ? DataArray : DataObject );

			var name = el;
			arguments[ 0 ] = jpath;
			var args = arguments;

			return this
					.get(el, true, elementType)
					.pipe(function( val ) {
					
						self.set( name, val );
						val.linkToParent( self, name );
						val.setChild.apply( val, args );
					})
					// 2 June 2014. This code has been removed.
					// Bubbling should be done within the triggerElement with parenting.
					//.done(function() {
						
					//});
		}
	};


	// 2 June 2014
	// In order to prevent looping, the trigger and bind change should only be called via the module model.

	var triggerChange = {
		value: function( noBubble, args ) {

			// 2 June 2014
			// This has been removed. No reason to trigger parent before self


			/*
			if ( ! this._dataChange ) {

				if( this.__parent ) {
					this.__parent.triggerChange( moduleid );
				}

				return;
			}
			*/

			if( this._dataChange ) {

				for( var i in this._dataChange ) {
					this._dataChange[ i ].apply( this, args );
				}
			}
			
			if( noBubble ) {
				return;
			}

			if( ! this.__parent ) {
				return;
			}

			this.__parent.triggerChange.apply( this.__parent, args );
		}
	};

	var bindChange = {
		value: function( callback ) {

			if ( ! this._dataChange) {

				Object.defineProperty(this, '_dataChange', {
					value: {},
					enumerable: false,
					writable: true,
					configurable: true
				});
			}

			var id = Util.getNextUniqueId( true );
			this._dataChange[ id ] = callback;
			callback.id = id;

			return id;
		}
	};

	var unbindChange = {
		value: function( idOrFunc ) {

			if( ! this._dataChange ) {
				Debug.log("Could not unbind event. No listener for this object");
				return false;
			}

			if( idOrFunc.id ) {
				idOrFunc = idOrFunc.id;
			}

			if( ! this._dataChange ) {
				delete this._dataChange[ idOrFunc ];
			}
		}
	};

	var getType = {
		value: function() {
			var type = typeof this;
			if (type !== "object") // Native types: number, string, boolean
				return type;
			if (this instanceof Array)
				return "array";
			if (this.hasOwnProperty("type") && (this.hasOwnProperty("value") || this.hasOwnProperty("url")))
				return this.type;
			return type;
		}
	};

	var fetch = {
		value: function() {

			var self = this,
					deferred = $.Deferred( );

			if (!this.url) { // No need for fetching. Still returning a deferred, though.
				return deferred.resolve(this);
			}
			require(['src/util/urldata'], function(urlData) { // We don't know yet if URLData has been loaded

				urlData.get(self.url, false, self.timeout).then(function(data) {

					data = DataObject.check(data, true);	// Transform the input into a DataObject

					Object.defineProperty(self, 'value', {// Sets the value to the object
						enumerable: self._keep || false, // If this._keep is true, then we will save the fetched data
						writable: true,
						configurable: false,
						value: data
					});

					deferred.resolve(self);
				}, function(data) {
					deferred.reject(self);
				});
			});

			return deferred;
		}
	};
	/*
	 * Performs a deep merge of an object into another.Properties of the from object will overwrite those of the to object.
	 * Result is different from jQuery.extend in the way that arrays are completely overwritten
	 */
	function merge(to, from) {
		for (var i in from) {
			var el = from[i];
			if (typeof el === "object") {
				if (el instanceof Array) {
					to[i] = el;
				}
				else if (el !== null) {
					if (!to[i])
						to[i] = {};
					merge(to[i], el);
				}
			} else {
				to[i] = el;
			}
		}
	}

	var mergeWithObject = {
		value: function(objectToMerge, moduleId, noBubble) {
			if((typeof (objectToMerge) !== "object") || (objectToMerge instanceof Array))
				return;
			merge(this, objectToMerge);
			this.triggerChange( noBubble, [ moduleId ] );
		}
	};

	var mergeWithArray = {
		value: function(objectToMerge, moduleId, noBubble) { // TODO find a way to implement this
			this.triggerChange( noBubble, [ moduleId ] );
			return Debug.warn("mergeWith method not yet implemented for DataArray");
		}
	};
	
	var setValue = {
		value: function(newValue) {
			if( this.hasOwnProperty("type") && this.hasOwnProperty("value") ) {
				if(this.value instanceof DataString || this.value instanceof DataNumber || this.value instanceof DataBoolean) {
					this.value.setValue(newValue);
				} else {
					this.value = newValue;
				}
			} else {
				Debug.warn("Cannot set value of untyped DataObject");
			}
		}
	};

	var commonProperties = {
		set: dataSetter,
		get: dataGetter,
		setChild: setChild,
		getChild: getChild,
		getChildSync: getChildSync,
		duplicate: dataDuplicator,
		trace: trace,

		traceSync: traceSync,
		onChange: bindChange,
		unbindChange: unbindChange,
		triggerChange: triggerChange,
		linkToParent: linkToParent,
		getType: getType,
		setValue: setValue
	};

	Object.defineProperties(DataObject.prototype, commonProperties);
	Object.defineProperties(DataArray.prototype, commonProperties);

	Object.defineProperty(DataObject.prototype, "fetch", fetch);
	Object.defineProperty(DataObject.prototype, "resurrect", resurrectObject);
	Object.defineProperty(DataObject.prototype, "mergeWith", mergeWithObject);

	Object.defineProperty(DataArray.prototype, "resurrect", resurrectArray);
	Object.defineProperty(DataArray.prototype, "mergeWith", mergeWithArray);
	
	// The toJSON method is automatically called when JSON.stringify is used
	var toJSON = {
		value: function() {
			return this.s_;
		}
	};
	
	var nativeGetter = {
		value: function() {
			return this;
		}
	};
	
	var resurrectNative = {
		value: function() {
			return this.valueOf();
		}
	};

	var commonProperties = {
		trace: trace,
		onChange: bindChange,
		unbindChange: unbindChange,
		triggerChange: triggerChange,
		linkToParent: linkToParent,
		resurrect: resurrectObject,
		toJSON: toJSON,
		get: nativeGetter,
		resurrect: resurrectNative,
		getChild: { value: function() { return $.Deferred().resolve( this ); } }
	};

	Object.defineProperties(DataString.prototype, commonProperties);
	Object.defineProperties(DataNumber.prototype, commonProperties);
	Object.defineProperties(DataBoolean.prototype, commonProperties);
	
	function isSpecialObject(object) {
		return( object instanceof DataObject || object instanceof DataArray || object instanceof DataString || object instanceof DataNumber || object instanceof DataBoolean );
	}

});