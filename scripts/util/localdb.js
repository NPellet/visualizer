define(['jquery'], function($) {

	var db, process;

	return {

		open: function() {
			// In the following line, you should include the prefixes of implementations you want to test.
			window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			// DON'T use "var indexedDB = ..." if you're not in a function.
			// Moreover, you may need references to some window.IDB* objects:
			window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
			window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
			// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

			var def = $.Deferred();	
			if(!indexedDB)
				return def.reject();

			if(db)
				return def.resolve();

			var req = indexedDB.open('ci', 26);	
			/*if(req.error)
				console.warn(req.error);*/

			req.onsuccess = function(e) {
				
				process = false;
				db = e.target.result;
				//def.resolve();
				def.resolve();
			};

			req.onupgradeneeded = function(e) {
				
				process = false;
				db = e.target.result;
				var def1 = $.Deferred(), def2 = $.Deferred();
			    if(db.objectStoreNames.contains("localview")) {
			    	db.deleteObjectStore("localview");
			    	//req.onsuccess = function() { def1.resolve(); }
			    }
		    
		   		if(db.objectStoreNames.contains("localdata")) {
			    	db.deleteObjectStore("localdata");
			    	//req2.onsuccess = function() { def2.resolve();}
			    }

		    	
				var def3 = $.Deferred(), def4 = $.Deferred();
				var req1 = db.createObjectStore("localdata", { keyPath: 'readURL'});
				var req2 = db.createObjectStore("localview", { keyPath: 'readURL' });

				req1.onsuccess = function() { def3.resolve(); }
				req2.onsuccess = function() { def4.resolve(); }

				$.when(def3, def4).then(function() {
					
					def.resolve();
				});	
			}

			req.onerror = function(e) {
				console.log(e.target);
				def.reject();
			}

			req.oncomplete = function(e) {
				console.warn(e.error)
				
			}

			return def;
		},

		getAll: function(type, key, branch) {

			var def = $.Deferred(), self = this;
			type = (type == 'data' || type == "localdata") ? 'localdata' : 'localview';

			var trans = db.transaction([type], 'readwrite');
			var store = trans.objectStore(type);
			var stack = {};
			
			if(branch)
				var req = store.get(key + ";" + branch);
			else {
				var req = store.openCursor();
			}

			req.onsuccess = function(e) {
				// If there is none, let's create it

				if(branch) {
					if(e.target.result == undefined) {
						self.create(type, key, branch).pipe(function(obj) {
							def.resolve(obj);
						});
					} else
						def.resolve(e.target.result);
				} else {
						
					if(e.target.result && e.target.result.key.indexOf(key) > - 1)
						stack[e.target.result.value.branch] = e.target.result.value;

					if(e.target.result)
						e.target.result["continue"]();
					else {

						def.resolve(stack);
					}
				}
			}

			req.onerror = function() {
				
			}

			return def;
		},

		create: function(type, key, branch) {

			// Create empty head, empty list

			obj = { readURL: key + ";" + branch, url: key, branch: branch, list: [], head: "{}" };

			var def = $.Deferred();

			type = (type == 'data' || type == "localdata") ? 'localdata' : 'localview';
			var trans = db.transaction(type, 'readwrite');
			var store = trans.objectStore(type);
			var req = store.put(obj);

			req.onsuccess = function(e) {
				def.resolve(obj);
			}

			return def;
		},

		storeToHead: function(type, key, branch, obj) {
			
			var def = $.Deferred(), self = this;
			type = (type == 'data' || type == "localdata") ? 'localdata' : 'localview';
			var trans = db.transaction(type, 'readwrite');
			var store = trans.objectStore(type);
			
			var req = store.get(key + ";" + branch);
			req.onsuccess = function(e) {

				if(e.target.result) {

					var obj2 = e.target.result;
					obj2.head = JSON.stringify(obj);
					var req2 = store.put(obj2);
					req2.onsuccess = function(e) {
						def.resolve(obj);
					}
				}
				else {
					
					self.create(type, key, branch).done(function() {
						self.storeToHead(type, key, branch, obj).done(function() {
							def.resolve(obj);
						});
					});
				}
			}
			return def;
		},

		store: function(type, key, branch, obj) {

			var def = $.Deferred();
			type = (type == 'data' || type == "localdata") ? 'localdata' : 'localview';
			var trans = db.transaction(type, 'readwrite');
			
			var store = trans.objectStore(type);	
			
			var req = store.get(key + ";" + branch),
				obj = JSON.stringify( obj );

			req.onsuccess = function(e) {

				if(e.target.result == null) {
					
					// Ok here we have a new branch => Save to the head.
					db.create(type, key, branch).done(function(resulted) {

						var trans = db.transaction(type, 'readwrite');
						var store = trans.objectStore(type);	
						resulted.head = obj;
						var req2 = store.put(resulted);
						req2.onsuccess = function(e) {
							def.resolve(obj);
						}

					});
				} else {
					
					var obj2 = e.target.result;
					obj2.list.push(obj);
					var req2 = store.put(obj2);
					req2.onsuccess = function(e) {
						def.resolve(obj);
					}
				}
			}
			return def;
		},

		getHead: function(type, key, branch) {
			var self = this;
			return this.open().pipe(function() {
				return self.getAll(type, key, branch).pipe(function(obj) {
					return obj.head;
				});
			})
		},

		getList: function(type, key, branch) {

			return db.getAll(type, key, branch).pipe(function(obj) {
				return obj.list;
			})
		}
	}
});
