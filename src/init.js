requirejs.config({
	"baseUrl": "",
	"paths": {
		"ace": "./components/ace/lib/ace",
		"d3": "./components/d3/d3.min",
		"fancytree": "./components/fancytree/src/jquery.fancytree",
		"jqgrid": "./components/jqgrid_edit/js/jquery.jqGrid",
		"jquery": "./components/jquery/jquery.min",
		"jqueryui": "./components/jquery-ui/ui/minified/jquery-ui.min",
		"ckeditor": "./components/ckeditor/ckeditor",
		"threejs": "./components/three.js/build/three.min",
		"forms": "./lib/forms",
		"plot": "./lib/plot/plot",
		'ChemDoodle': 'lib/chemdoodle/ChemDoodleWeb-unpacked',
        "pouchdb": "./components/pouchdb/dist/pouchdb-nightly.min"
	},
        packages: [
            {
                name: "uri",
                location: "./components/uri.js/src",
                main: "URI"
            }
        ],

	"shim": {
        "d3": {
            "exports" : "d3"
        },
        "threejs": {
            "exports" : "THREE"
        },
        "components/x2js/xml2json.min": {
            "exports" : "X2JS"
        },
        "components/leaflet/leaflet" : {
            "exports" : "L",
            "init" : function() {
                return this.L.noConflict();
            }
        },
        "components/jit/Jit/jit" : {
            "exports" : "$jit"
        },
	//	"ckeditor": ["./components/ckeditor/adapters/jquery"],
		"jqgrid": ["jquery", "components/jqgrid_edit/js/i18n/grid.locale-en"],
		"libs/jsmol/js/JSmolApplet": ["libs/jsmol/JSmol.min.nojq"],
		"lib/flot/jquery.flot.pie": ["jquery","lib/flot/jquery.flot"],
		"jqueryui": ["jquery"],
		"ChemDoodle": ["lib/chemdoodle/ChemDoodleWeb-libs"],
                "components/farbtastic/src/farbtastic" : ["components/jquery/jquery-migrate.min"],
                "lib/pixastic/pixastic" : ["lib/pixastic/pixastic/pixastic.core"],
                'components/fancytree/src/jquery.fancytree.dnd' : ["fancytree"],
                "lib/parallel-coordinates/d3.parcoords": ["d3"]
	}
});


require(['jquery', 'src/main/entrypoint', 'src/header/header', 'src/util/pouchtovar'], function($, EntryPoint, Header, PouchDBUtil) {

	DataObject = function(l, checkDeep, forceCopy) {	
		for(var i in l) {
			if(l.hasOwnProperty(i)) {
				if(!checkDeep) {
					this[i] = l[i];
					continue;
				} else {
					this[i] = DataObject.check(l[i], true, forceCopy);
				}
			}
		}

		if( forceCopy ) {
			this.unbindChange();
			this._name = null;
			this._parent = null;	
		}
	};

	ViewObject = function(l, checkDeep, forceCopy) {	
		for(var i in l) {
			if(l.hasOwnProperty(i)) {
				if(!checkDeep) {
					this[i] = l[i];
					continue;
				} else {
					this[i] = ViewObject.check(l[i], true, forceCopy);
				}
			}
		}
	};

	ViewObject.check = function(el, check, forceCopy) {
		
		if( ! forceCopy && ( el instanceof ViewObject || el instanceof ViewArray ) ) {
			return el;
		} else if(el instanceof Array) {
			return new ViewArray(el, check, forceCopy);
		} else if(el === null) {
			return null;
		} else if(typeof el == "object") {
			return new ViewObject(el, check, forceCopy);
		} else {
			return el;
		}
	};


	DataObject.check = function(el, check, forceCopy) {

		if( ! forceCopy && ( el instanceof DataObject || el instanceof DataArray ) ) {
			return el;
		} else if(el instanceof Array) {
			return new DataArray(el, check, true);
		} else if(el === null) {
			return null;
		} else if(typeof el == "object") {
			return new DataObject(el, check, true);
		} else {
			return el;
		}
	};

	$.extend(ViewObject.prototype, Object.prototype);
	$.extend(DataObject.prototype, Object.prototype);

	
	ViewArray = function(arr, deep) { 
	  arr = arr || [];
	  if(deep)
	  	for(var i = 0, l = arr.length; i < l; i++)
	  		arr[i] = ViewObject.check(arr[i], deep);
	  arr.__proto__ = ViewArray.prototype;
	  return arr;
	}
	ViewArray.prototype = new Array;


	function DataArray(arr, deep) { 
	  arr = arr || [];
	  if(deep)
	  	for(var i = 0, l = arr.length; i < l; i++)
	  		arr[i] = DataObject.check(arr[i], deep);
	  arr.__proto__ = DataArray.prototype;
	  return arr;
	}
	DataArray.prototype = new Array;

	window.ViewArray = ViewArray;
	window.DataArray = DataArray;


	var resurectObject = {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function() {
			var obj = {};
			for( var i in this ) {

				if( this[ i ] instanceof DataArray || this[ i ] instanceof DataObject ) {
					obj[ i ] = this[ i ].resurect()
				} else {
					obj[ i ] = this[ i ];
				}
			}

			return obj;
		}
	};

	var resurectArray = {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function() {
			var obj = [];
			for( var i = 0, l = this.length ; i < l ; i ++ ) {
				if( typeof this[ i ] == "object" ) {
					obj[ i ] = this[ i ].resurect()
				} else {
					obj[ i ] = this[ i ];
				}
			}

			return obj;
		}
	};



	var viewSetter = {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function(k, l, check) {
			//console.log('View has changed');

			if(check) {
				if(l instanceof Array)
					l = new ViewArray(l, true);
				else if(typeof l == 'object')
					l = new ViewObject(l, true);
			}

			this[k] = l;
		}
	}

	var dataSetter = {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function(k, l) {
			//console.log('Data has changed');
			this[k] = l;
			return this;
		}
	}

	var dataGetter = {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function(el, returnDeferred) {
			if(el !== undefined) {
				var val = this.get();
				if(returnDeferred) { // Returns a deferred if asked
					if(val[el] !== undefined) {
						if(val[el] && val[el].fetch) {
							return val[el].fetch();
						} else {
							return $.Deferred().resolve(val[el]);
						}
					} else {
						return $.Deferred().reject();
					}
				} else {
					if(val[el])
						return val[el];
					else
						return;
				}
			}

			if(this.value && this.type)
				return this.value;
			return this;
		}
	}


	var dataDuplicator = {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function( source ) {
			return DataObject.check( this, true, true );
		}
	}




	var getChild = {
		value: function( jpath, setParents ) {

			if(jpath && jpath.split) { // Old version
				jpath = jpath.split('.');
				jpath.shift();
			}

			if(!jpath || jpath.length == 0) {
				return $.Deferred().resolve(this);
			}

			var el = jpath.shift(); // Gets the current element and removes it from the array
			var self = this;

			var subEl = this.get(el, true).pipe( function( subEl ) {

				if( setParents ) {

					switch( typeof subEl ) {

						case 'string':
							subEl = new DataObject( { type: "string", value: subEl } );
						break;

						case 'number':
							subEl = new DataObject( { type: "number", value: subEl } );
						break;
					}

					if( subEl.linkToParent ) {
						subEl.linkToParent( self, el );
					}
				}

				if( jpath.length == 0 ) {
					return subEl;
				}


				return subEl.getChild( jpath, setParents );
			});

			return subEl;
		},

		enumerable: false
	};


	var getChildSync = {
		value: function( jpath, setParents ) {

			if( jpath && jpath.split ) { // Old version
				jpath = jpath.split( '.' );
				jpath.shift( );
			}

			if( ! jpath ) {
				return;
			}

			var el = jpath.shift(); // Gets the current element and removes it from the array
			var subEl = this.get(el, false);

			switch( typeof subEl ) {
				case 'undefined':
					return;
				break;

				case 'string':
					subEl = new DataObject( { type: "string", value: subEl } );
				break;

				case 'number':
					subEl = new DataObject( { type: "number", value: subEl } );
				break;
			}

			if( ! subEl.__parent ) {

				Object.defineProperty( subEl, '__parent', { value: this, writable: false, configurable: false, enumerable: false });
				Object.defineProperty( subEl, '__name', { value: el, writable: false, configurable: false, enumerable: false });

			}

			if( jpath.length === 0 ) {
				return subEl;
			}

			return subEl.getChildSync( jpath, setParents );
		}
	};


	var linkToParent = {
		value: function( parent, name ) {

			if( this.__parent ) {
				return;
			}
			
			parent[ name ] = this;

			Object.defineProperty( this, '__parent', { value: parent, writable: false, configurable: false, enumerable: false } );
			Object.defineProperty( this, '__name', { value: name, writable: false, configurable: false, enumerable: false } );
		},

		enumerable: false
	};


	var setChild = {
		value: function( jpath, newValue, options ) {
			var self = this;

			options = options || {};

			if(jpath.split) { // Old version
				jpath = jpath.split('.');
				jpath.shift();
			}
			
			if(!jpath || jpath.length === 0) {
				this.value = newValue;
				this.triggerChange( options.moduleid );
				return $.Deferred().resolve( this );
			}

			var jpathLength = jpath.length;
			if(jpathLength === 1) { // Ok we're done, let's set it

				return $.Deferred().resolve( this.set( jpath[0], newValue ) ).then( function() {

					if( ! options.mute ) {
			//			self.triggerChange( options.moduleid );
					}

				});
			}

			var el = jpath.shift();
			if(!this[el]) // We need to set an empty object to create the elements
				this.set(el, new DataObject());
//console.log('setChild', self, jpath, newValue);
			return this
					.get(el, true)
					.pipe(function(el) { el.setChild(jpath, newValue, options) })
					.done(function() { 
						// This has been commented so that there's no trigger for every level, which would cause the first level 
						// to trigger n times (n = nb of levels in jpath).
						// HOWEVER, that may cause an issue for the updating of subelements of the main element
						// This can be solved. We'd have to prevent parenting the trigger and uncomment this line
						if( ! options.mute ) {
							self.triggerChange( options.moduleid, true );
						}
					} );
		}
	};

	var dataChanged = {
		value: function( moduleid, noBubble ) {
			
			if( ! this._listenersDataChanged ) {


				if( this.__parent ) {
					this.__parent.triggerChange( moduleid );
				}

				return;
			}

			var i = 0, 
				l = this._listenersDataChanged.length;

			for ( ; i < l; i++ ) {

				if( moduleid === undefined || ( this._listenersDataChanged[i][1] !== moduleid ) ) {

					this._listenersDataChanged[ i ][ 0 ].call( this, this );

				}
			}

			// Trigger on the parent if it exists !
			if( this.__parent && ! noBubble && this.__parent.triggerChange ) {
				this.__parent.triggerChange( moduleid );
			}

		},

		enumerable: false
	}

	var listenDataChanged = {
		value: function(callback, moduleid) {
			
			if(!this._listenersDataChanged)
				Object.defineProperty(this, '_listenersDataChanged', {
					value: [],
					enumerable: false,
					writable: true,
					configurable: true
				});

			this._listenersDataChanged.push([callback, moduleid]);
		},
		enumerable: false
	}

	var unbindChange = {
		value: function( moduleid ) {
			
			if( this._listenersDataChanged ) {
				for( var i = 0, l = this._listenersDataChanged.length ; i < l ; i ++ ) {

					if( ! moduleid || this._listenersDataChanged[ i ][ 1 ] == moduleid ) {
						this._listenersDataChanged.splice(i, 1);
					}
				}
			}
		},

		enumerable: false
	};

	var getType = {
		value: function() {
			var type = typeof this;
			if(type !== 'object')
				return type;
			if(this instanceof Array)
				return "array";
			if(this.type && (this.value || this.url))
				return this.type;
			if(typeof this == "object")
				return "object";
			// Native types: int, string, boolean
			return type;
		}
	}

	var fetch = {

		value: function() {

			var self = this,
				deferred = $.Deferred( );

			if( !this.url ) { // No need for fetching. Still returning a deferred, though.
				return deferred.resolve( this );
			}

			var type = this.getType( );

			require( [ 'src/util/urldata' ], function( urlData ) { // We don't know yet if URLData has been loaded

				urlData.get( self.url , false , self.timeout ).then( function(data) {

					data = DataObject.check( data, true );	// Transform the input into a DataObject
					
					Object.defineProperty( self, 'value', {	// Sets the value to the object
						enumerable: self._keep || false, // If this._keep is true, then we will save the fetched data
						writable: true,
						configurable: false,
						value: data
					} );

					deferred.resolve( self );
					

				}, function( data ) { 

					deferred.reject( self ); 
				});
			});
			
			return deferred;
		}
	};

	Object.defineProperty(ViewObject.prototype, 'set', viewSetter);
	Object.defineProperty(ViewArray.prototype, 'set', viewSetter);
	Object.defineProperty(DataObject.prototype, 'set', dataSetter);
	Object.defineProperty(DataArray.prototype, 'set', dataSetter);

	Object.defineProperty(DataObject.prototype, 'get', dataGetter);
	Object.defineProperty(DataArray.prototype, 'get', dataGetter);

	Object.defineProperty(DataObject.prototype, 'setChild', setChild);
	Object.defineProperty(DataArray.prototype, 'setChild', setChild);

	Object.defineProperty(DataObject.prototype, 'fetch', fetch);
	Object.defineProperty(ViewObject.prototype, 'fetch', fetch);

	Object.defineProperty(DataObject.prototype, 'getChild', getChild);
	Object.defineProperty(DataArray.prototype, 'getChild', getChild);
        
	Object.defineProperty(DataObject.prototype, 'getChildSync', getChildSync);
	Object.defineProperty(DataArray.prototype, 'getChildSync', getChildSync);

	Object.defineProperty(DataObject.prototype, 'onChange', listenDataChanged);
	Object.defineProperty(DataArray.prototype, 'onChange', listenDataChanged);

	Object.defineProperty(DataObject.prototype, 'duplicate', dataDuplicator);
	Object.defineProperty(DataArray.prototype, 'duplicate', dataDuplicator);

	Object.defineProperty(DataObject.prototype, 'resurect', resurectObject);
	Object.defineProperty(DataArray.prototype, 'resurect', resurectArray);


	Object.defineProperty(DataObject.prototype, 'unbindChange', unbindChange);
	Object.defineProperty(DataArray.prototype, 'unbindChange', unbindChange);


	Object.defineProperty(DataObject.prototype, 'linkToParent', linkToParent);
	Object.defineProperty(DataArray.prototype, 'linkToParent', linkToParent);

	Object.defineProperty(DataObject.prototype, 'triggerChange', dataChanged);
	Object.defineProperty(DataArray.prototype, 'triggerChange', dataChanged);

	Object.defineProperty(DataObject.prototype, 'getType', getType);
	Object.defineProperty(DataArray.prototype, 'getType', getType);

	Object.defineProperty(ViewObject.prototype, 'getType', getType);
	Object.defineProperty(ViewArray.prototype, 'getType', getType);

	Object.defineProperty(String.prototype, 'getType', {
		value: function() { return 'string'; }
	});

	Object.defineProperty(Number.prototype, 'getType', {
		value: function() { return 'number'; }
	});




	PouchObject = function(l, checkDeep, forceCopy) {	
		for(var i in l) {
			if(l.hasOwnProperty(i)) {
				if(!checkDeep) {
					this[i] = l[i];
					continue;
				} else {
					this[i] = DataObject.check(l[i], true, forceCopy);
				}
			}
		}

		if( forceCopy ) {
		
			this.unbindChange();
			this._name = null;
			this._parent = null;
			this._rev = null;
			this._id = null;
		}

		var self = this;
		this.onChange( function() {
			
			var toSave = self.exportForPouch();
			console.log( toSave );
			PouchDBUtil.getPouch( self.getPouch() ).put( toSave, self._id, self._rev, function( err, callback ) {
				console.log(err, callback);
			} );
		} )
	};

	PouchObject.prototype = new DataObject;

	Object.defineProperty( PouchObject.prototype, "setPouch", {

		enumerable: false,
		writable: false,
		configurable: false,
		value: function( pouchName ) {
			this._pouchName = pouchName;
		}
	});
	

	Object.defineProperty( PouchObject.prototype, "getPouch", {

		enumerable: false,
		writable: false,
		configurable: false,
		value: function() {
			return this._pouchName;
		}
	});



	Object.defineProperty( PouchObject.prototype, "exportForPouch", {

		enumerable: false,
		writable: false,
		configurable: false,
		value: function() {

			var obj = new DataObject();

			for( var i in this ) {

				if( typeof this[ i ] == "function ") {
					continue;
				}

				if( ( i ).slice( 0, 1 ) == "_") {
					continue;
				}

				obj[ i ] = this[ i ];
			}

			return obj.resurect();
		}
	});

	
	function PouchArray(arr, deep) { 
	  arr = { type: 'array', value: arr || [] };
	  
	  if(deep) {
	  	for(var i = 0, l = arr.value.length; i < l; i++) {
	  		arr.value[i] = new PouchObject(arr.value[i], deep);
	  	}
	  }

	  arr.__proto__ = PouchArray.prototype;
	  return arr;
	}

	PouchArray.prototype = new DataArray;

	PouchArray.prototype.setPouch = function( pouchName ) {
		this._pouchName = pouchName;
	}

	PouchArray.prototype.getPouch = function( ) {
		return this._pouchName;
	}

	PouchArray.prototype.push = function() {
		console.log('PUSHING');
		// arguments contain the element to push
		Array.prototype.push.apply( this.value, arguments );
		console.log( "Pouch Array has a new element. Pushing into Pouch");

		PouchDBUtil.getPouch( this.getPouch() ).post( arguments[ 0 ], function() {
			console.log(arguments);
			console.log( "Pouch has saved your data" );
		});
	}

	PouchArray.prototype.splice = function() {

		var elementsRemoved = Array.prototype.splice.apply( this.value, arguments ),
			pouch = PouchDBUtil.getPouch( this.getPouch() );

		for( var i = 0, l = elementsRemoved.length ; i < l ; i ++ ) {
			pouch.remove( elementsRemoved[ i ] );
		}

		return elementsRemoved;
	}

	PouchArray.prototype.get = function() {
	
		return this;
	}


	window.PouchObject = PouchObject;
	window.PouchArray = PouchArray;



	$(document).ready(function() {
            require(["uri/URI.fragmentQuery"],function(URI){
                		var title = $("#title");
		var buttons = $("#visualizer-buttons");
                
                var url = new URI(window.location.href);
                var type = (url.search().length > 0) ? "search" : "fragment";

                var query = new URI(url[type]()).query(true);

		var entryPoint = EntryPoint.init(query, type.replace(type[0],type[0].toUpperCase()));
		//Header.setTitle(title, Versioning.getViewHandler());
            });
	});
});
