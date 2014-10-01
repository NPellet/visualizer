define([ 'src/util/util', 'src/util/debug' ], function( Util, Debug ) {
    "use strict";

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

	DataObject.check = function( object, transformNatives, duplicate ) {
	
		if ( isSpecialObject( object ) ) {

			return object;

		} else if( object instanceof Array ) {

			object.__proto__ = DataArray.prototype;
			return object;

		} else if( object === null ) {

			return null;

		} else {
			var type = typeof object;

			if( type === "object" ) {
				object.__proto__ = DataObject.prototype;
				return object;
			}

			if( ! transformNatives ) {
				return object;
			}

			return transformNative( object );
		}
	};



	DataObject.recursiveTransform = function( object, transformNatives ) {

		object = DataObject.check(object, transformNatives);
        var i, l;

		if( object instanceof Array ) {

			for( i = 0, l = object.length ; i < l ; i ++ ) {
				object[ i ] = DataObject.check( object[ i ], transformNatives );
				DataObject.recursiveTransform( object[ i ], transformNatives );
			}
		} else if( object instanceof Object ) {

			for( i in object ) {

				object[ i ] = DataObject.check( object[ i ], transformNatives );
				DataObject.recursiveTransform( object[ i ], transformNatives );
			}

		}

		return object;
	};


    function duplicate(object) {

        var type = typeof object;
        if (type === 'number' || type === 'string' || type === 'boolean') {
            return object;
        } else if (type === 'undefined' || type === 'function') {
            return;
        }

        var target, i, l;

        if (isSpecialNativeObject(object)) {
            return transformNative(object);
        } else if (object instanceof Array) {
            l = object.length;
            target = new Array(l);
            if (object instanceof DataArray) {
                target = DataArray(target);
            }
            for (i = 0; i < l; i++) {
                target[i] = duplicate(object[i]);
            }
        } else {
            var keys = Object.keys(object);
            l = keys.length;
            if (object instanceof DataObject) {
                target = new DataObject();
            } else {
                target = {};
            }
            for (i = 0; i < l; i++) {
                target[keys[i]] = duplicate(object[keys[i]]);
            }
        }

        return target;

    }


	var duplicator = {

		value: function( transformNatives ) {
			
			return duplicate( this );
		}
	};

	function DataString( s ) {
		this.s_ = String(s);
    }

	var StringProperties = ["charAt", "charCodeAt", "concat", "fromCharCode", "indexOf", "lastIndexOf", "localCompare", 
							"match", "replace", "search", "slice", "split", "substr", "substring", "toLocaleLowerCase", "toLocaleUpperCase",
							"toLowerCase", "toUpperCase", "trim" ];

	for( var i = 0, l = StringProperties.length ; i < l ; i ++ ) {
		( function ( j ) {
			
			DataString.prototype[ StringProperties[ j ] ] = function() {
				return String.prototype[ StringProperties[ j ] ].apply( this.s_, arguments );
			};

		} ) ( i );
	}

	DataString.prototype.getType = function() {
		return "string";
	};
	
	DataString.prototype.nativeConstructor = String;

	function DataNumber( s ) {
		this.s_ = Number(s);
	}

	DataNumber.prototype.getType = function() {
		return "number";
	};
	
	DataNumber.prototype.nativeConstructor = Number;

	function DataBoolean( s ) {
		this.s_ = Boolean(s);
	}
	
	DataBoolean.prototype.getType = function() {
		return "boolean";
	};
	
	DataBoolean.prototype.nativeConstructor = Boolean;
	
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
		value: function( prop, returnPromise, constructor ) {

			// Looking for this[ prop ]
			if ((typeof prop === "string") || (typeof prop === "number")) {

				if (returnPromise) { // Returns a promise if asked

                    return this.get(true).then(function (val) {
                        if(typeof val !== "object" || val === null)
                            return val;
                        if (typeof val[ prop ] !== "undefined") {
                            if(!isSpecialObject(val[prop])) {
                                val[prop] = DataObject.check(val[prop], true);
                            }
                            if(val[prop] instanceof DataObject) {
                                return val[prop].fetch(true);
                            } else {
                                return val[prop];
                            }
                        } else if( constructor ) {
                            val[ prop ] = new constructor();
                            return val[prop];
                        }
                    });

				} else {

                    var val = this.get(); // Current value
					
					if(typeof val !== "object" || val === null)
						return val;
					
					if (typeof val[ prop ] !== "undefined") {
						val[ prop ] = DataObject.check( val[ prop ], 1 ); // Single recursion
					}
					return val[prop];

				}
			} else {
                if(prop === true) {
                    if(this.hasOwnProperty("type") && this.hasOwnProperty("value")) {
                        return Promise.resolve(this.value);
                    } else if (this.hasOwnProperty("type") && this.hasOwnProperty("url")) {
                        return this.fetch(true);
                    } else {
                        return Promise.resolve(this);
                    }
                } else {
                    if (this.hasOwnProperty("value") && this.hasOwnProperty("type"))
                        return this.value;
                    return this;
                }
            }
		}
	};

    var dataSetter = {
        value: function(prop, value, noTrigger) {

            var valueTyped = DataObject.check( value, true );

            if(!valueTyped) {
                this[ prop ] = valueTyped;
            } else {
                var type = valueTyped.getType();

                this[ prop ] = DataObject.check( this[ prop ] );

                var typeNow = this[ prop ] !== undefined && this[ prop ].getType ? this[ prop ].getType() : undefined;

                if( typeNow !== type ) {
                    this[ prop ] = valueTyped;
                } else if( type === "string" || type === "number" || type === "boolean" ) {
                    this[ prop ].setValue(valueTyped.get(), noTrigger);
                } else if( valueTyped !== this[ prop ] ) {
                    this[ prop ] = valueTyped;
                }
            }
            if (!noTrigger) {
                this.triggerChange(false, []);
            }
            return this[ prop ];
        }
    };


    var getChild = {
        value: function (jpath) {

            if (typeof jpath === 'string') { // Old version
                jpath = jpath.split('.');
                jpath.shift();
            }

            if (!jpath || jpath.length === 0) {
                return Promise.resolve(this);
            }

            jpath = jpath.slice();

            var el = jpath.shift(); // Gets the current element and removes it from the array

            return this.get(el, true).then(function (subEl) {
                subEl = DataObject.check(subEl, true);

                if (!subEl || (jpath.length === 0)) {
                    return subEl;
                } else {
                    return subEl.getChild(jpath);
                }
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
				return Promise.resolve(this);
			}
			
			jpath = jpath.slice();

			var el = jpath.shift(); // Gets the current element and removes it from the array
			var self = this;

			var elementType = jpath.length == 0 ? constructor : ( typeof el == "number" ? DataArray : DataObject );

			return this.get( el, true, elementType ).then(function( subEl ) {
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
			
			jpath = jpath.slice();

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
			
			jpath = jpath.slice();

			var el = jpath.shift( ); // Gets the current element and removes it from the array
			var subEl = this.get( el );

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
		value: function( jpath, newValue, triggerParams, constructor ) {

            var self = this;

            if (typeof jpath === 'string') { // Old version
                jpath = jpath.split('.');
                jpath.shift();
            }

            jpath = jpath.slice();

            var jpathLength = jpath.length;

            if (jpathLength === 0) {
                throw new Error('setChild cannot be called with an empty jPath');
            }

            var el = jpath.shift();

            if (jpathLength === 1) {
                var res = self.set(el, newValue, true);
                if (res && res.linkToParent) {
                    res.linkToParent(self, el);
                    res.triggerChange(false, triggerParams);
                } else {
                    self.triggerChange(false, triggerParams);
                }
                return;
            }

            var elementType = jpath.length === 0 ? constructor : ( typeof jpath[0] === "number" ? DataArray : DataObject );

            var name = el;

            var args = [jpath, newValue, triggerParams, constructor];

            return this
                .get(el, true, elementType)
                .then(function (val) {
                    self.set(name, val, true);
                    val.linkToParent(self, name);
                    val.setChild.apply(val, args);
                });
        }
	};

    var triggerBubble = {
        value: function (args) {

            if( this._dataChange ) {
                for( var i in this._dataChange ) {
                    this._dataChange[ i ].apply( this, args );
                }
            }

            if( ! this.__parent ) {
                return;
            }

            args[0].jpath.unshift(this.__name);

            this.__parent._triggerBubble.call( this.__parent, args );

        }
    };


	// 2 June 2014
	// In order to prevent looping, the trigger and bind change should only be called via the module model.

	var triggerChange = {
		value: function( noBubble, args ) {

            if(!Array.isArray(args)) {
                if(args == undefined) {
                    args = [];
                } else {
                    args = [args];
                }
            }

            args.unshift({
                target: this,
                jpath: []
            });

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

            args[0].jpath.unshift(this.__name);

			this.__parent._triggerBubble.call( this.__parent, args );
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
				Debug.info("Could not unbind event. No listener for this object");
				return false;
			}

			if( idOrFunc.id ) {
				idOrFunc = idOrFunc.id;
			}

			delete this._dataChange[ idOrFunc ];
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
		value: function(forceJson) {

			if (this.value || !this.url) { // No need for fetching. Still returning a promise, though.
				return Promise.resolve(this);
			}

            var self = this;
            return new Promise(function (resolve, reject) {
                require(['src/util/urldata'], function (urlData) { // We don't know yet if URLData has been loaded

                    var headers;
                    if (forceJson) {
                        headers = {
                            Accept: "application/json"
                        };
                    }

                    urlData.get(self.url, false, self.timeout, headers).then(function (data) {

                        data = DataObject.check(data, true);	// Transform the input into a DataObject

                        Object.defineProperty(self, 'value', {// Sets the value to the object
                            enumerable: self._keep || false, // If this._keep is true, then we will save the fetched data
                            writable: true,
                            configurable: false,
                            value: data
                        });

                        resolve(self);
                    }, function (err) {
                        Debug.debug('Could not fetch '+self.url+' ('+err+')');
                    });
                });
            });
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
		trace: trace,
		duplicate: duplicator,
		traceSync: traceSync,
		onChange: bindChange,
		unbindChange: unbindChange,
		triggerChange: triggerChange,
        _triggerBubble: triggerBubble,
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
	
	var nativeGetter = {
		value: function() {
			return this.s_;
		}
	};
	
	var getChildNative = {
		value: function() {
			return Promise.resolve( this );
		}
	};
	
	var setValueNative = {
		value: function(value, noTrigger) {
			this.s_ = this.nativeConstructor(value);
            if (!noTrigger) {
                this.triggerChange(false, []);
            }
		}
	};

	var nativeToString = {
		value: function() {
			return String(this.s_);
		}
	};

	var commonNativeProperties = {
		trace: trace,
		onChange: bindChange,
		unbindChange: unbindChange,
		triggerChange: triggerChange,
		linkToParent: linkToParent,
		toJSON: nativeGetter, // The toJSON method is automatically called when JSON.stringify is used
		get: nativeGetter,
		resurrect: nativeGetter,
		getChild: getChildNative,
		valueOf: nativeGetter,
		setValue: setValueNative,
		toString: nativeToString
	};

	Object.defineProperties(DataString.prototype, commonNativeProperties);
	Object.defineProperties(DataNumber.prototype, commonNativeProperties);
	Object.defineProperties(DataBoolean.prototype, commonNativeProperties);
	
	function isSpecialObject(object) {
		return( object instanceof DataObject || object instanceof DataArray || isSpecialNativeObject( object ) );
	}

	function isSpecialNativeObject( object ) {
		return ( object instanceof DataString || object instanceof DataNumber || object instanceof DataBoolean) ;
	}

	function transformNative( object ) {

		var type;

		if( isSpecialNativeObject( object ) ) {
			type = object.getType();
			object = object.get();
		} else {
			type = typeof object
		}


		switch ( type ) {

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

});
