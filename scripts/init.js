
requirejs.config({
	"baseUrl": "scripts/",
	"paths": {
		"jquery": "http://code.jquery.com/jquery-migrate-1.2.1",
		"jqueryui": "libs/jqueryui/jquery-ui.min",
		"forms": "libs/forms",
		"ckeditor": "libs/ckeditor/ckeditor"
	},

	"shim": {
		"jquery": ['libs/jquery/jquery'],
		"ckeditor": ["libs/ckeditor/adapters/jquery"],
		"libs/jqgrid/js/jqgrid": ["jquery", "libs/jqgrid/js/i18n/grid.locale-en"],
		"libs/jsmol/js/JSmolApplet": ["libs/jsmol/JSmol.min.nojq"],
		"jqueryui": ["jquery"]
	}
});

require(['jquery', 'main/entrypoint', 'main/header'], function($, EntryPoint, Header) {

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
		if(Array.isArray(el))
			return new ViewArray(el, check);
		else if(el === null)
			return null;
		else if(typeof el == "object")
			return new ViewObject(el, check);
		else
			return el;
	};


	DataObject.check = function(el, check) {
		if(Array.isArray(el))
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
	ViewArray.prototype.last = function() {
	  return this[this.length - 1];
	};
	

	function DataArray(arr, deep) { 
	  arr = arr || [];
	  if(deep)
	  	for(var i = 0, l = arr.length; i < l; i++)
	  		arr[i] = DataObject.check(arr[i], deep);
	  arr.__proto__ = DataArray.prototype;
	  return arr;
	}
	DataArray.prototype = new Array;
	DataArray.prototype.last = function() {
	  return this[this.length - 1];
	};
	
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
				if(Array.isArray(l))
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
			if(el) {
				var val = this.get();
				if(returnDeferred) { // Returns a deferred if asked
					if(val[el]) {
						if(val[el].fetch)
							return val[el].fetch();
						else
							return $.Deferred().resolve(val[el]);
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

			if(jpath.split) { // Old version
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
					.done(function() { if(!options.mute) self._dataChanged(options.moduleid); });
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
					writable: true
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
				deferred = $.Deferred();
			if(this.url && this.type) {
				var type = this.getType();
				require(['util/urldata'], function(urlData) {
					urlData.get(self.url, false, self.timeout).then(function(data) {
						
						if(Array.isArray(data))
							data = new DataArray(data, true);
						else if(typeof data == "object")
							data = new DataObject(data, true);

						if(self.keep) {
							self.value = data;
							deferred.resolve(this);
						} else {
							deferred.resolve(new DataObject({type: type, value: data}));
						}

					}, function(data) { });
				});
				return deferred;
			}
			return deferred.resolve(this);
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

		if(urls['header'])
			Header.init(urls);

		//Header.setTitle(title, Versioning.getViewHandler());
	});
});

/*			
			CI.WebWorker.create('jsonparser', './scripts/webworker/scripts/jsonparser.js');
			CI.WebWorker.create('getminmaxmatrix', './scripts/webworker/scripts/getminmaxmatrix.js');
			CI.WebWorker.create('computesprings', './scripts/webworker/scripts/computesprings.js');
			CI.WebWorker.create('googleVisualizationArrayToDataTable', './scripts/webworker/scripts/googleVisualizationArrayToDataTable.js');
*/