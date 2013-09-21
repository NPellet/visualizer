
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
					if(Array.isArray(l[i]))
						this[i] = new DataArray(l[i], true);
					else if(typeof l[i] == "object")
						this[i] = new DataObject(l[i], true);
					else
						this[i] = l[i];
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
					if(Array.isArray(l[i]))
						this[i] = new ViewArray(l[i], true);
					else if(typeof l[i] == "object")
						this[i] = new ViewObject(l[i], true);
					else
						this[i] = l[i];
				}
			}
		}
	};
	$.extend(ViewObject.prototype, Object.prototype);
	$.extend(DataObject.prototype, Object.prototype);

	
	ViewArray  = function(l, checkDeep) {
		for(var i = 0, ll = l.length; i < ll; i++) {
			if(!checkDeep) {
				this.push(l[i]);
				continue;
			} else {
				if(Array.isArray(l[i]))
					this.push(new ViewArray(l[i], true));
				else if(typeof l[i] == "object")
					this.push(new ViewObject(l[i], true));
				else
					this.push(l[i]);
			}
		}
	}
	ViewArray.prototype = new Array;
	

	DataArray  = function(l, checkDeep) {
		for(var i = 0, ll = l.length; i < ll; i++) {
			if(!checkDeep) {
				this.push(l[i]);
				continue;
			} else {
				if(Array.isArray(l[i]))
					this.push(new DataArray(l[i], true));
				else if(typeof l[i] == "object")
					this.push(new DataObject(l[i], true));
				else
					this.push(l[i]);
			}
		}
	}
	DataArray.prototype = new Array;
	

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
				if(this[el]) {
					
					if(returnDeferred) // Returns a deferred if asked
						if(this[el].fetch)
							return this[el].fetch();
						else
							return $.Deferred().resolve(this[el]);

					return this[el];
				}
				return;
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
			if(this[el]) {
				return this
						.get(el, true)
						.pipe(function(el) { 
							if(el.getChild) { // If the element could be fetched further down
								return el.getChild(jpath);
							} else {
								return el;
							}
						});
			} else {
				return $.Deferred().reject(); // Failure : el is not found
			}
		}
	};

	var setChild = {
		value: function(jpath, newValue, options) {
			var self = this;

			if(!jpath || jpath.length == 0)
				return $.Deferred().reject();

			if(jpath.length == 1) // Ok we're done, let's set it
				return $.Deferred().resolve(element.set(jpath[0], newValue));

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
					data._listenersDataChanged[i][0].call(this, this);
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
			var deferred = $.Deferred();
			if(this.url && this.type) {
				var type = this.getType();
				require(['util/urldata'], function(urlData) {
					urlData.get(this.url, false, this.timeout).then(function(data) {

						if(this.keep) {
							this.value = data;
							deferred.resolve(this);
						} else {
							deferred.resolve({type: type, value: data});
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