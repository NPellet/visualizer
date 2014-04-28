/*
 *	Intended behaviour: new element in the couch must trigger a first level variable change.
 *	In the words, the trigger is that the whole array has changed.
 *
 *	On a new revision, only the child element must be changed. triggerChange must be somehow used.
 *	Perhaps a deep extend is needed. Otherwise we need to copy the listeners and callbacks !
 */

define(['components/pouchdb/dist/pouchdb-nightly', 'uri/URI'], function(PouchDB, URI) {
	"use strict";
	
	var exports = {};
	
	function PouchObject(l, checkDeep, forceCopy) {	
		
		this.initProperties();
		
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
			this.__name = null;
			this.__parent = null;
			this._rev = null;
			this._id = null;
		}
		
		this.addChangeListener();
	};

	PouchObject.prototype = Object.create(DataObject.prototype);
	Object.defineProperty(PouchObject.prototype, "constructor", PouchObject);
	
	Object.defineProperty( PouchObject.prototype, "initProperties", {
		value: function(){
			Object.defineProperty(this, "__pouch", {value: this.__pouch, writable: true});
			Object.defineProperty(this, "__name", {value: this.__name, writable: true});
			Object.defineProperty(this, "__parent", {value: this.__parent, writable: true});
			Object.defineProperty(this, "_id", {value: this._id, writable: true});
			Object.defineProperty(this, "_rev", {value: this._rev, writable: true});
		}
	});
	
	Object.defineProperty( PouchObject.prototype, "setPouch", {
		value: function( pouchManager ) {
			this.__pouch = pouchManager;
		}
	});

	Object.defineProperty( PouchObject.prototype, "getPouch", {
		value: function() {
			return this.__pouch;
		}
	});

	Object.defineProperty( PouchObject.prototype, "exportForPouch", {
		value: function() {

			var obj = new DataObject();

			for( var i in this ) {

				if( typeof this[ i ] === "function ") {
					continue;
				}

				if( ( i ).slice( 0, 1 ) === "_") {
					continue;
				}

				obj[ i ] = this[ i ];
			}

			return obj.resurrect();
		}
	});
	
	Object.defineProperty(PouchObject.prototype, "addChangeListener", {
		value: function() {
			if(this.hasChangeListener)
				return;
			Object.defineProperty(this, "hasChangeListener", {value: true});
			var queue = [];
			var saving = false;
			
			var self = this;
			function doSave(safe) {
				if(saving && !safe)
					return;
				saving = true;
				var el = queue.shift();
				self.getPouch().pouchdb.put(el, self._id, self._rev, function(err, response) {
					if(err)
						return console.error("Error while writing PouchObject", err);
					self._rev = response.rev;
					if(queue.length)
						doSave(true);
					else
						saving = false;
				});
			}
			this.onChange(function() {
				var toSave = self.exportForPouch();
				queue.push(toSave);
				doSave();
			}, "internal_pouch_change" );
		}
	});

	PouchObject.from = function(baseObject, pouchManager ,deep , forceNew) {
		if(forceNew) {
			baseObject = new PouchObject(baseObject, deep, forceNew);
		}
		else {
			if(!(baseObject instanceof PouchObject)) {
				baseObject.__proto__ = PouchObject.prototype;
				baseObject.initProperties();
				baseObject.addChangeListener();
			}
			if(deep) {
				for(var i in baseObject) {
					if(baseObject.hasOwnProperty(i))
						baseObject[i] = DataObject.check(baseObject[i], true, forceNew);
				}
			}
		}
		
		baseObject.setPouch(pouchManager);

		return baseObject;
	};
	
	function PouchArray(arr, deep) {
		this.type = 'array';
		this.value = arr || [];
		
		Object.defineProperty(this, "__pouch", {writable: true});
		
		if(deep) {
			for(var i = 0, l = this.value.length; i < l; i++) {
				this.value[i] = new PouchObject(this.value[i], deep);
				this.value[i].__parent = this;
			}
		}
	};

	PouchArray.prototype = Object.create(DataObject.prototype);
	Object.defineProperty(PouchArray.prototype, "constructor", PouchArray);

	PouchArray.prototype.setPouch = function(pouchManager) {
		this.__pouch = pouchManager;
		for(var i = 0, l = this.value.length; i < l; i ++) {
			this.value[i].__pouch = pouchManager;
		}
	};

	PouchArray.prototype.getPouch = function() {
		return this.__pouch;
	};

	PouchArray.prototype.push = function() {
		var manager;
		if(!(manager = this.getPouch())) {
			console.error("No Pouch manager has been defined for this array. Aborting push procedure.");
			return;
		}
		
		Array.prototype.push.apply(this.value, arguments);
		
		var l = arguments.length;
		var docs = Array(l);
		var args = Array(l);
		for(var i = 0; i < l; i++) {
			var doc = PouchObject.from(arguments[i], manager, true);
			docs[i] = doc.resurrect();
			args[i] = doc;
		}
		manager.pouchdb.bulkDocs({docs: docs}).then(function(res){
			for(var i = 0; i < l; i++) {
				args[i]._rev = res[i].rev;
			}
		}).catch(function(err){
			console.error("An error occured while pushing into PouchArray.", err);
		});
		
		this.triggerChange("internal_pouch_change");
	};

	PouchArray.prototype.splice = function() {
		var manager;
		if(!(manager = this.getPouch())) {
			console.error("No Pouch manager has been defined for this array. Aborting splice procedure.");
			return;
		}
		var elementsRemoved = Array.prototype.splice.apply(this.value, arguments);

		for(var i = 0, l = elementsRemoved.length ; i < l ; i ++ ) {
			manager.pouchdb.remove( elementsRemoved[ i ] );
		}
		
		this.triggerChange("internal_pouch_change");
		return elementsRemoved;
	};
	
	var PouchFactory = (function(){
		var allPouch = {};
		return {
			get: function(name){
				if(!allPouch[name]) {
					allPouch[name] = new PouchManager(name); 
				}
				return allPouch[name];
			}
		};
	})();
	
	var allSyncs = {};
	function SyncManager(serverURL) {
		this.url = serverURL;
		this.urlH = serverURL.replace(/\/\/[^\/]*@/, "//***@");
		this.froms = {};
		this.tos = {};
		this.run();
	}
	
	SyncManager.prototype.add = function(fromCouch, couchURL, pouch) {
		
		var pouchName = pouch.name;
		var urlH = couchURL.replace(/\/\/[^\/]*@/, "//***@");
		
		function complete(err, res) {
			if(err) {
				if (fromCouch)
					return console.error("Replication from couchDB " + urlH + " to localDB " + pouchName + " failed.", err);
				else
					return console.error("Replication from localDB " + pouchName + " to couchDB " + urlH + " failed.", err);
			} else {
				if (fromCouch)
					return console.info("Replication from couchDB " + urlH + " to localDB " + pouchName + " aborted.", res);
				else
					return console.info("Replication from localDB " + pouchName + " to couchDB " + urlH + " aborted.", res);
			}
		}
		
		var callback;
		if(fromCouch) {
			if(this.froms[pouchName])
				return;
			
			callback = function() {
				console.info("Started replication from couchDB " + urlH + " to localDB " + pouchName + ".");
				return pouch.pouchdb.replicate.from(couchURL, {
					live: true,
					complete: complete
				});
			};
			
			this.froms[pouchName] = callback;
		}
		else {
			if(this.tos[pouchName])
				return;
			
			callback = function() {
				console.info("Started replication from localDB " + pouchName + " to couchDB " + urlH + ".");
				return pouch.pouchdb.replicate.to(couchURL, {
					live: true,
					complete: complete
				});
			};
			
			this.tos[pouchName] = callback;
		}
		if(this.online)
			this.running.push(callback());
	};
	
	function checkURL(url) {
		return new Promise(function(resolve, reject){
			var req = new XMLHttpRequest();
			req.open('GET', url);
			req.onload = function() {
				if(req.status === 200) {
					resolve();
				}
				else {
					reject(Error(req.status+" : "+req.statusText));
				}
			};
			req.onerror = function() {
				reject(Error("Network error"));
			};
			req.send();
		});
	}
	
	SyncManager.prototype.run = function() {
				
		if(this.isRunning)
			return;
		this.isRunning = true;
		
		this.online = false;
		this.running = [];
		
		var that = this;
		
		var callback = function(){
			var i;
			checkURL(that.url).then(
					function(){
						console.info(that.urlH+" is responding.");
						if(that.online)
							return;
						console.log("Start replications");
						for(i in that.froms) {
							that.running.push(that.froms[i]());
						}
						for(i in that.tos) {
							that.running.push(that.tos[i]());
						}
						that.online = true;
					},
					function(err){
						console.error(that.urlH+" is not responding.", err);
						if(!that.online)
							return;
						console.log("Stop replications");
						while(that.running.length > 0){
							that.running.pop().cancel();
						}
						that.online = false;
					}
			);
		};
		
		callback();
		this.interval = window.setInterval(callback,60000);
	};
	
	function getServerURL(url) {
		var uri = new URI(url);
		uri.normalize();
		var segment = uri.segment();
		while(segment.length>0) {
			var lastPart = segment.pop();
			if(lastPart) {
				uri.segment(segment);
				break;
			}
		}
		return uri.toString();
	}
	
	function doSync(fromCouch, pouch, couchURL) {
		var serverURL = getServerURL(couchURL);
		if(!allSyncs[serverURL]) {
			allSyncs[serverURL] = new SyncManager(serverURL);
		}
		var syncManager = allSyncs[serverURL];
		syncManager.add(fromCouch, couchURL, pouch);
	}
	
	function PouchManager(name) {
		this.name = name;
		this.pouchdb = new PouchDB(name);
		this.singleDocs = {};
		var that = this;
		this.pouchdb.info().then(function(info){
			that.pouchdb.changes({
				live: true,
				since: info.update_seq,
				include_docs: true,
				onChange: function(change) {
					if(that.singleDocs[change.id]) {
						if(change.deleted) {
							that.singleDocs[change.id].setPouch(null);
							delete that.singleDocs[change.id];
						}
						else {
							if(that.singleDocs[change.id]._rev !== change.doc._rev) { // If revID is the same, it means the change was already done in the visualizer
								that.singleDocs[change.id].mergeWith(change.doc, "internal_pouch_change");
							}
						}
					}
					if(that.allDocs) {
						var arr = that.allDocs.value, index = -1;
						for(var i = 0, l = arr.length; i < l; i++) {
							if(arr[i]._id === change.id) {
								index = i;
								break;
							}
						}
						if(index === -1) { // Doc is not in the array
							if(!change.deleted) {
								var pouchobj = new PouchObject(change.doc, true);
								pouchobj.setPouch(that);
								arr.push(pouchobj)
								that.allDocs.triggerChange("internal_pouch_change");
							}
						}
						else {
							if(change.deleted) { // Remove object from the array
								arr[index].setPouch(null);
								arr.splice(index, 1);
								that.allDocs.triggerChange("internal_pouch_change");
							}
							else { // Modify object in the array
								if(arr[index]._rev !== change.doc._rev) {
									arr[index].mergeWith(change.doc, "internal_pouch_change");
								}
							}
						}
					}
				}
			});
		});
	}
	
	PouchManager.prototype.sync = function(fromCouch, couchURL) {
		doSync(fromCouch, this, couchURL);
	};
	
	PouchManager.prototype.getDoc = function(id, options) {
		if(this.singleDocs[id])
			return Promise.resolve(this.singleDocs[id]);
		
		options = options || {};
		var that = this;
		return new Promise(function(resolve){
			var pouchobj;
			that.pouchdb.get(id, options).then(function(doc){
				pouchobj = new PouchObject(doc, true);
				pouchobj.setPouch(that);
				that.singleDocs[id] = pouchobj;
				resolve(pouchobj);
			}).catch(function(err){
				console.info("Doc "+id+" does not exist, creating new doc.", err);
				pouchobj = new PouchObject({_id: id});
				pouchobj.setPouch(that);
				that.singleDocs[id] = pouchobj;
				resolve(pouchobj);
			});
		});
	};
	
	PouchManager.prototype.getDocs = function(options) {
		if(this.allDocs)
			return Promise.resolve(this.allDocs);
		
		options = options || {};
		options.include_docs = true;
		
		var that = this;
		return new Promise(function(resolve){
			that.pouchdb.allDocs(options).then(function(allDocs){
				var all = [];
				for (var i = 0, l = allDocs.rows.length; i < l; i++) {
					all.push(allDocs.rows[i].doc);
				}
				all = new PouchArray(all, true);
				all.setPouch(that);
				that.allDocs = all;
				resolve(all);
			}).catch(function(err){
				console.warn("Error in pouchdb.allDocs", err);
				/*var arr = new PouchArray();
				arr.setPouch(that);
				that.allDocs = arr;
				resolve(arr);*/
			});
		});
	};

	exports.replicate = function(name, couchURL, direction) {
		
		if(!name || !couchURL)
			return;
		
		var pouch = PouchFactory.get(name);
		
		if (direction === "CtoP" || direction === "both") {
			pouch.sync(true, couchURL);
		}
		
		if (direction === "PtoC" || direction === "both") {
			pouch.sync(false, couchURL);
		}
		
	};
	
	exports.abortReplications = function() {
		for(var i in allSyncs) {
			var sync = allSyncs[i];
			if(sync.isRunning) {
				window.clearInterval(sync.interval);
				while(sync.running.length > 0){
					sync.running.pop().cancel();
				}
			}
			delete allSyncs[i];
		}
	};

	exports.pouchToVar = function(dbname, id, callback, options) {

		var pouch;

		if (!(pouch = exports.getManager(dbname))) {
			return;
		}
		
		if(typeof id === "function") {
			options = callback;
			callback = id;
			id = false;
		}

		if (id) {
			pouch.getDoc(id, options).then(callback);
		}
		else {
			pouch.getDocs(options).then(callback);
		}
	};
	
	exports.getManager = function(name) {
		if(name)
			return PouchFactory.get(name);
	};

	return exports;

});
