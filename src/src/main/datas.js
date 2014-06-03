define([ 'jquery', 'src/util/util' ], function( $, Util ) {

	function DataObject(object, recursive, forceCopy) {
		if (object) {
			for (var i in object) {
				if (object.hasOwnProperty(i)) {
					if (recursive) {
						this[i] = DataObject.check(object[i], recursive, forceCopy);
					} else {
						this[i] = object[i];
					}
				}
			}
		}
	}

	DataObject.check = function(object, recursiveLevel, forceCopy) {
		
//console.log( recursiveLevel );
		
		if( recursiveLevel === undefined ) {
			recursiveLevel = 1;
		}

		if( recursiveLevel <= 0 ) {
			return object;
		}

		recursiveLevel--;

		if (!forceCopy && (object instanceof DataObject || object instanceof DataArray)) {
			return object;
		} else if (object instanceof Array) {
			return new DataArray(object, recursiveLevel, forceCopy);
		} else if (object === null) {
			return null;
		} else if (typeof object === "object") {
			return new DataObject( object, recursiveLevel, forceCopy );
		} else {
			return new DataObject( { type: typeof object, value: object }, 0 );
		}
	};

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

	function ViewObject(object, recursive, forceCopy) {
		if (object) {
			for (var i in object) {
				if (object.hasOwnProperty(i)) {
					if (recursive) {
						this[i] = ViewObject.check(object[i], true, forceCopy);
					} else {
						this[i] = object[i];
					}
				}
			}
		}
	}

	ViewObject.check = function(object, recursive, forceCopy) {
		if (!forceCopy && (object instanceof ViewObject || object instanceof ViewArray)) {
			return object;
		} else if (object instanceof Array) {
			return new ViewArray(object, recursive, forceCopy);
		} else if (object === null) {
			return null;
		} else if (typeof object === "object") {
			return new ViewObject(object, recursive, forceCopy);
		} else {
			return object;
		}
	};

	function ViewArray(arr, recursive, forceCopy) {
		var newArr = [];
		if (arr) {
			if (!(arr instanceof Array))
				throw "ViewArray can only be constructed from arrays";
			for (var i = 0, l = arr.length; i < l; i++) {
				if (recursive) {
					newArr[i] = ViewObject.check(arr[i], recursive, forceCopy);
				} else {
					newArr[i] = arr[i];
				}
			}
		}
		newArr.__proto__ = ViewArray.prototype;
		return newArr;
	}

	ViewObject.prototype = Object.create(DataObject.prototype);
	Object.defineProperty(ViewObject.prototype, "constructor", ViewObject);

	ViewArray.prototype = Object.create(DataArray.prototype);
	Object.defineProperty(ViewArray.prototype, "constructor", ViewArray);

	window.ViewObject = ViewObject;
	window.ViewArray = ViewArray;

	var nativeTypes = ["string", "boolean", "number", "undefined"];

	var resurrectObject = {
		value: function() {
			var obj = {};
			if (nativeTypes.indexOf(this.getType()) > -1)
				return this.get();
			for (var i in this) {
				if (this[i] instanceof DataArray || this[i] instanceof DataObject) {
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
				if (this[i] instanceof DataArray || this[i] instanceof DataObject) {
					obj[i] = this[i].resurrect();
				} else {
					obj[i] = this[i];
				}
			}
			return obj;
		}
	};

	var dataGetter = {
		value: function( prop, returnDeferred ) {

			// Looking for this[ prop ]
			if (typeof prop !== "undefined") {

				var val = this.get(); // Current value

				// Create dataobject out of the element
				// Allows for pseudo-recursion on getting the element

				//console.log( this, DataArray.prototype.constructor, this.__proto__.constructor );
				val[ prop ] = DataObject.check( val[ prop ], 1 ); // Singe recursion

				if (returnDeferred) { // Returns a deferred if asked

					if (typeof val[ prop ] !== "undefined") {

						if (val[prop] && val[prop].fetch) {
							return val[prop].fetch();
						} else {
							return $.Deferred().resolve(val[prop]);
						}
					} else {
						return $.Deferred().reject();
					}
				} else {

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
			if (recursive) {
				if (value instanceof Array)
					value = new DataArray(value, true);
				else if (typeof value === 'object')
					value = new DataObject(value, true);
			}
			this[prop] = value;
			return this;
		}
	};

	var viewSetter = {
		value: function(prop, value, recursive) {
			if (recursive) {
				if (value instanceof Array)
					value = new ViewArray(value, true);
				else if (typeof value === 'object')
					value = new ViewObject(value, true);
			}
			this[prop] = value;
			return this;
		}
	};

	var dataDuplicator = {
		value: function(source) {
			return DataObject.check(this, true, true);
		}
	};

	var getChild = {
		value: function(jpath, setParents) {

			if (jpath && jpath.split) { // Old version
				jpath = jpath.split('.');
				jpath.shift();
			}

			if ( ! jpath || jpath.length === 0 ) {
				return $.Deferred().resolve(this);
			}

			var el = jpath.shift(); // Gets the current element and removes it from the array
			var self = this;

			return this.get( el, true ).pipe(function( subEl ) {

				// 2 june 2014
				// This has to be automatic !
				//if (setParents) {

					switch ( typeof subEl ) {

						case 'string':
							subEl = new DataObject({type: "string", value: subEl});
							break;

						case 'number':
							subEl = new DataObject({type: "number", value: subEl});
							break;
							
						case 'boolean':
							subEl = new DataObject({type: "boolean", value: subEl});
					}

					if( subEl && subEl.linkToParent ) {
						subEl.linkToParent(self, el);
					}
				// }

				if (!subEl || (jpath.length === 0)) {
					return subEl;
				}


				return subEl.getChild(jpath, setParents);
			});

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

			var el = jpath.shift(); // Gets the current element and removes it from the array
			var subEl = this.get(el, false);

			if (subEl === null)
				return;

			switch (typeof subEl) {
				case 'undefined':
					return;
					break;

				case 'string':
					subEl = new DataObject({type: "string", value: subEl});
					break;

				case 'number':
					subEl = new DataObject({type: "number", value: subEl});
					break;

				case 'boolean':
					subEl = new DataObject({type: "boolean", value: subEl});
					break;
			}

			if (!subEl.__parent) {

				Object.defineProperty(subEl, '__parent', {value: this, writable: false, configurable: false, enumerable: false});
				Object.defineProperty(subEl, '__name', {value: el, writable: false, configurable: false, enumerable: false});

			}

			if (jpath.length === 0) {
				return subEl;
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
		value: function( jpath, newValue, noMute ) {
			var self = this;

			var mute = false;
			if( noMute === undefined ) {
				mute = true;
			}

			
			var onChangeOptions = Array.prototype.slice.call( arguments, 2 );

			if( jpath.split ) { // Old version
				jpath = jpath.split('.');
				jpath.shift();
			}

			// Cannot go further. No jpath here
			if( ! jpath || jpath.length === 0 ) {
				this.value = newValue;
				// Bubbling allowed
				self.triggerChange( true, onChangeOptions );
				return $.Deferred().resolve(this);
			}

			var jpathLength = jpath.length;
			if (jpathLength === 1) { // Ok we're done, let's set it

				return $.Deferred().resolve(this.set(jpath[0], newValue)).then(function() {

					if ( ! mute ) {
						// This is the last set. Now we can trigger the whole stack
						self.triggerChange( true, onChangeOptions );
					}

				});
			}

			var el = jpath.shift();
			// We need to set an empty object to create the elements
			if ( ! this[ el ] ) {
				this.set( el, new DataObject( ) );
			}

			arguments[ 0 ] = jpath;

			return this
					.get(el, true)
					.pipe(function(el) {
						el.setChild.call( el, arguments );
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
			this.triggerChange(moduleId, noBubble);
		}
	};

	var mergeWithArray = {
		value: function(objectToMerge, moduleId, noBubble) { // TODO find a way to implement this
			this.triggerChange(moduleId, noBubble);
			return console.warn("mergeWith method not yet implemented for DataArray");
		}
	};

	var commonProperties = {
		set: dataSetter,
		get: dataGetter,
		setChild: setChild,
		getChild: getChild,
		getChildSync: getChildSync,
		
		duplicate: dataDuplicator,
		
		onChange: bindChange,
		unbindChange: unbindChange,
		triggerChange: triggerChange,


		linkToParent: linkToParent,
		
		getType: getType
	};

	Object.defineProperties(DataObject.prototype, commonProperties);
	Object.defineProperties(DataArray.prototype, commonProperties);

	Object.defineProperty(DataObject.prototype, "fetch", fetch);
	Object.defineProperty(DataObject.prototype, "resurrect", resurrectObject);
	Object.defineProperty(DataObject.prototype, "mergeWith", mergeWithObject);

	Object.defineProperty(DataArray.prototype, "resurrect", resurrectArray);
	Object.defineProperty(DataArray.prototype, "mergeWith", mergeWithArray);

	// Special setters for view objects
	Object.defineProperty(ViewObject.prototype, 'set', viewSetter);
	Object.defineProperty(ViewArray.prototype, 'set', viewSetter);

});