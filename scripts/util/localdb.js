

CI.DB = {};
CI.DB.open = function() {
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

	if(CI.DB.db)
		return def.resolve();

	var req = indexedDB.open('ci', 22);	
	/*if(req.error)
		console.warn(req.error);*/

	req.onsuccess = function(e) {
		
		CI.DB.db = e.target.result;
		//def.resolve();
		def.resolve();
	};

	req.onupgradeneeded = function(e) {
		
		CI.DB.db = e.target.result;
		var def1 = $.Deferred(), def2 = $.Deferred();
	    if(CI.DB.db.objectStoreNames.contains("localview")) {
	    	CI.DB.db.deleteObjectStore("localview");
	    	//req.onsuccess = function() { def1.resolve(); }
	    }
    
   		if(CI.DB.db.objectStoreNames.contains("localdata")) {
	    	CI.DB.db.deleteObjectStore("localdata");
	    	//req2.onsuccess = function() { def2.resolve();}
	    }

    	
		var def3 = $.Deferred(), def4 = $.Deferred();
		var req1 = CI.DB.db.createObjectStore("localdata", { keyPath: 'readURL'});
		var req2 = CI.DB.db.createObjectStore("localview", { keyPath: 'readURL' });

		req1.onsuccess = function() { def3.resolve(); }
		req2.onsuccess = function() { def4.resolve(); }

		$.when(def3, def4).then(function() {
			
			def.resolve();
		});	
	}

	req.onerror = function(e) {
		console.log(e.target);
	}

	req.oncomplete = function(e) {
		console.warn(e.error)
		
	}

	return def;
}


CI.DB.getAll = function(type, key, branch) {

	var def = $.Deferred();
	type = (type == 'data' || type == "localdata") ? 'localdata' : 'localview';

	var trans = CI.DB.db.transaction([type], 'readwrite');
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
				CI.DB.create(type, key, branch).pipe(function(obj) {
					def.resolve(obj);
				});
			} else
				def.resolve(e.target.result);
		} else {
				
			if(e.target.result && e.target.result.key.indexOf(key) > - 1)
				stack[e.target.result.value.branch] = e.target.result.value;

			if(e.target.result)
				e.target.result.continue();
			else {

				def.resolve(stack);
			}
		}
	}

	req.onerror = function() {
		
	}

	return def;
}

CI.DB.create = function(type, key, branch) {

	// Create empty head, empty list

	obj = { readURL: key + ";" + branch, url: key, branch: branch, list: [], head: {} };

	var def = $.Deferred();

	type = (type == 'data' || type == "localdata") ? 'localdata' : 'localview';
	var trans = CI.DB.db.transaction(type, 'readwrite');
	var store = trans.objectStore(type);
	var req = store.put(obj);
	req.onsuccess = function(e) {
		def.resolve(obj);
	}

	return def;
}

CI.DB.storeToHead = function(type, key, branch, obj) {
	
	var def = $.Deferred();
	type = (type == 'data' || type == "localdata") ? 'localdata' : 'localview';
	var trans = CI.DB.db.transaction(type, 'readwrite');
	var store = trans.objectStore(type);
	
	var req = store.get(key + ";" + branch);
	req.onsuccess = function(e) {
		if(e.target.result) {
			e.target.result.head = obj;
			var req2 = store.put(e.target.result);
			req2.onsuccess = function(e) {
				def.resolve(obj);
			}
		}
		else {
			
			CI.DB.create(type, key, branch).done(function() {
				CI.DB.storeToHead(type, key, branch, obj).done(function() {
					def.resolve(obj);
				});
			});
		}
	}
	return def;
}


CI.DB.store = function(type, key, branch, obj) {

	var def = $.Deferred();
	type = (type == 'data' || type == "localdata") ? 'localdata' : 'localview';
	var trans = CI.DB.db.transaction(type, 'readwrite');
	console.log(trans);
	var store = trans.objectStore(type);	
	console.log(store);
	var req = store.get(key + ";" + branch);

	req.onsuccess = function(e) {

		if(e.target.result == null) {
			console.log('Need to create branch');
			// Ok here we have a new branch => Save to the head.
			CI.DB.create(type, key, branch).done(function(resulted) {

				var trans = CI.DB.db.transaction(type, 'readwrite');
				var store = trans.objectStore(type);	
				console.log('Attempt to save');
				resulted.head = obj;
				var req2 = store.put(resulted);
				req2.onsuccess = function(e) {
					console.log('saved');
					def.resolve(obj);
				}

			});
		} else {
			
			var obj2 = e.target.result;
			obj2.list.push(obj);
			var req2 = store.put(obj2);
			req2.onsuccess = function(e) {
				console.log('Saved');
				def.resolve(obj);
			}
		}
	}
	return def;
}

CI.DB.getHead = function(type, key, branch) {

	return CI.DB.open().pipe(function() {
		return CI.DB.getAll(type, key, branch).pipe(function(obj) {
			return obj.head;
		});
	})
}

CI.DB.getList = function(type, key, branch) {

	return CI.DB.getAll(type, key, branch).pipe(function(obj) {
		return obj.list;
	})
}
