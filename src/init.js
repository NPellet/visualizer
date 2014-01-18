
requirejs.config({
	"baseUrl": "",
	"paths": {
		"ace": "./components/ace/lib/ace/",
		"d3": "./components/d3/d3.min",
		"fancytree": "./components/fancytree/src/jquery.fancytree",
		"jqgrid": "./components/jqgrid_edit/js/jquery.jqGrid",
		"jquery": "./components/jquery/jquery.min",
		"jqueryui": "./components/jquery-ui/ui/minified/jquery-ui.min",
		"ckeditor": "./components/ckeditor/ckeditor",
		"threejs": "./components/three.js/build/three.min",
		"forms": "./lib/forms/",
		"plot": "./lib/plot/plot",
		'ChemDoodle': 'lib/chemdoodle/ChemDoodleWeb-unpacked'
	},

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
		"ckeditor": ["./components/ckeditor/adapters/jquery"],
		"jqgrid": ["jquery", "components/jqgrid/js/i18n/grid.locale-en"],
		"libs/jsmol/js/JSmolApplet": ["libs/jsmol/JSmol.min.nojq"],
		"lib/flot/jquery.flot.pie": ["jquery","lib/flot/jquery.flot"],
		"jqueryui": ["jquery"],
		"ChemDoodle": ["lib/chemdoodle/ChemDoodleWeb-libs"],
                "components/farbtastic/src/farbtastic" : ["components/jquery/jquery-migrate.min"]
	}
});


require(['jquery', 'src/main/entrypoint', 'src/header/header'], function($, EntryPoint, Header) {

	DataObject = function(l, checkDeep) {	
		for(var i in l) {
			if(l.hasOwnProperty(i)) {
				if(!checkDeep) {
					this[i] = l[i];
					continue;
				} else {
					this[i] = DataObject.check(l[i], true);
				}
			}
		}
	};

	ViewObject = function(l, checkDeep) {	
		for(var i in l) {
			if(l.hasOwnProperty(i)) {
				if(!checkDeep) {
					this[i] = l[i];
					continue;
				} else {
					this[i] = ViewObject.check(l[i], true);
				}
			}
		}
	};

	ViewObject.check = function(el, check) {
		
		if(el instanceof ViewObject || el instanceof ViewArray) {
			return el;
		} else if(el instanceof Array)
			return new ViewArray(el, check);
		else if(el === null)
			return null;
		else if(typeof el == "object")
			return new ViewObject(el, check);
		else
			return el;
	};


	DataObject.check = function(el, check) {

		if(el instanceof DataObject || el instanceof DataArray) {
			return el;
		} else if(el instanceof Array)
			return new DataArray(el, check);
		else if(el === null)
			return null;
		else if(typeof el == "object")
			return new DataObject(el, check);
		else
			return el;
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



	//DataArray.prototype = new Array;
	//console.

	var viewSetter = {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function(k, l, check) {
			console.log('View has changed');

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
			console.log('Data has changed');
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

	var getChild = {
		value: function(jpath) {

			if(jpath && jpath.split) { // Old version
				jpath = jpath.split('.');
				jpath.shift();
			}

			if(!jpath || jpath.length == 0)
				return $.Deferred().resolve(this);
			else if(jpath.length == 0) {// Last element
				return this.get(el, true);
			}

			var el = jpath.shift(); // Gets the current element and removes it from the array

			return this
					.get(el, true)
					.pipe(function(el) { 
						if(el.getChild) { // If the element could be fetched further down
							return el.getChild(jpath);
						} else {
							return el;
						}
					});
		}
	};

	var setChild = {
		value: function(jpath, newValue, options) {
			var self = this;

			if(jpath.split) { // Old version
				jpath = jpath.split('.');
				jpath.shift();
			}
			
			if(!jpath || jpath.length == 0)
				return $.Deferred().reject();

			if(jpath.length == 1) // Ok we're done, let's set it
				return $.Deferred().resolve(this.set(jpath[0], newValue));

			var el = jpath.shift();
			if(!this[el]) // We need to set an empty object to create the elements
				this.set(el, new DataObject());

			return this
					.get(el, true)
					.pipe(function(el) { el.setChild(jpath, newValue, options) })
					.done(function() { if(!options.mute) self.triggerChange(options.moduleid); });
		}
	};

	var dataChanged = {
		value: function(moduleid) {
			
			if(!this._listenersDataChanged)
				return;

			var i = 0, 
				l = this._listenersDataChanged.length;

			for (; i < l; i++) {
				if(moduleid === undefined || (this._listenersDataChanged[i][1] !== moduleid)) {
					this._listenersDataChanged[i][0].call(this, this);
				}
			}
		}
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
			
		}
	}


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

			if( !this.url || !this.type ) { // No need for fetching. Still returning a deferred, though.
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

	Object.defineProperty(DataObject.prototype, 'onChange', listenDataChanged);
	Object.defineProperty(DataArray.prototype, 'onChange', listenDataChanged);

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



	$(document).ready(function() {

		var title = $("#title");
		var buttons = $("#visualizer-buttons");

		var url = window.document.location.search.substring(1).split('&'),
			urls = {};
		for(var i = 0; i < url.length; i++) {
			var args = url[i].split('=');
			urls[args[0]] = unescape(args[1]);
		}


		var entryPoint = EntryPoint.init(urls);
		//Header.setTitle(title, Versioning.getViewHandler());
	});
});
