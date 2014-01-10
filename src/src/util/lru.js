
// LRU
define(['jquery', 'src/util/debug'], function($, Debug) {

	var memory = {}, 
		memoryHead = {}, 
		memoryCount = {}, 
		memoryLimit = {};

	var indexedDB, IDBTransaction, IDBKeyRange;
	var db, dbname = 'cilru';

	function getFromMemory(store, index) {
		var obj, head;
		if(memory[store] && memory[store][index]) {

			head = memoryHead[store];

			obj = memory[store][index];
			obj.prev = head;
			obj.next = head.next;
			head.next.prev = obj;
			head.next = obj;

			memoryHead[store] = obj;
			return obj.data;
		}
	}

	function storeInMemory(store, index, data) {
		var toStore, toDelete, head;
		if(memory[store] && memoryCount[store] && memoryLimit[store]) {
			head = memoryHead[store];
			if(memory[store][index])
				return getFromMemory(store, index);

			toStore = { data: { data: data, timeout: Date.now() } };

			if(typeof head == "undefined") {
				toStore.prev = toStore;
				toStore.next = toStore;
			} else {
				toStore.prev = head.prev;
				toStore.next = head.next;			
				head.next.prev = toStore;
				head.next = toStore;
			}

			memoryHead[store] = toStore;
			// Effictively store the data
			memory[store][index] = toStore;
			memoryCount[store]++;

			// Remove oldest one
			if(memoryCount[store] > memoryLimit[store] && head) {
				toDelete = head.next;
				head.next.next.prev = head;
				head.next = head.next.next;
				toDelete.next.next = undefined;
				toDelete.next.prev = undefined;
				delete toDelete;
				memoryCount[store]--;
			}

			return data;
		}
	}

	function createStoreMemory(store, limit) {
		limit = limit || 50;
		if(!memory[store]) {
			memory[store] = {};
			memoryCount[store] = 0;
		}

		memoryLimit[store] = limit;
	}

	function createStoreDB(store, limit) {
		limit = limit || 500;
		var storeName = store;
		var deferred = $.Deferred();

		$.when(openDb()).then(function() {

			var store = db.transaction(['lru'], 'readwrite').objectStore('lru');
			var lruGet = store.get('__lrudata' + storeName);

			lruGet.onsuccess = function(e) {
				var lru = e.target.result;
				// Add the store only if it doesn't exist
				if(!lru)
					store.put({index: '__lrudata' + storeName, data: {}, store: storeName, key: '__lrudata', _count: 0, _limit: limit });
			}
			deferred.resolve();
		}, function() {
			console.warn('IDB opening failure');
			deferred.reject();
		});

		return deferred;
	}

	function emptyMemory(store) {
		memoryCount[store] = 0;
		memory[store] = {};
		memoryHead[store] = undefined;
	}

	function openDb() {

		var ready = $.Deferred();

		if(!dbname)
			return ready.reject("No database to use");

		if(db)
			return ready.resolve(db);

		// Store references from cross compatibility
		indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
		IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
		
		if(!indexedDB) {
			ready.reject();
			return ready;
		}

		var openrequest = indexedDB.open(dbname, 1);

		// Database is open
		openrequest.onsuccess = function(e) {
			
			db = e.target.result;
			ready.resolve();
		}

		openrequest.onerror = function(e) {
			
			console.log(e);
			ready.reject();
		}

		openrequest.onupgradeneeded = function(e) {
			db = e.target.result;
   			if(db.objectStoreNames.contains('lru'))
   				return;
			var objectStore = db.createObjectStore('lru', { keyPath: 'index'});
			objectStore.createIndex('key', 'key', {unique: true});
			objectStore.createIndex('store', 'store', {unique: false});

			objectStore.onsuccess = function() { 

			}

		}

		return ready;
	}

	function getFromDB(storeName, index) {

		var deferred = $.Deferred();

		$.when(openDb()).then(function() {

			var store = db.transaction('lru', 'readwrite').objectStore('lru'),
				getter = store.get(storeName + index),
				data,
				defGet = $.Deferred(), defSet = $.Deferred();

			getter.onsuccess = function(e) {

				if(e.target.result)
					defGet.resolve(e.target.result.data);
				else
					defGet.reject();
			}

			getter = store.get('__lrudata' + storeName);
			getter.onsuccess = function(e) {
				var lru = e.target.result;

				if(!lru)
					return defGet.reject();

				lru.data[index] == Date.now(); // Update the date of the object
				setter = store.put(lru);

				setter.onsuccess = function(e) {
					defSet.resolve();
				}
			}

			$.when(defGet, defSet).then(function(data) {

				// A getter from the db must trigger a setter in the memory
				storeInMemory(storeName, index, data);
				deferred.resolve(data);
			}, function() {
				deferred.reject();
			});
			
		}, function() {
			console.warn('IDB opening failure');
			deferred.reject();
		});

		return deferred;
	}

	function storeInDb(store, index, data) {
		var storeName = store;
		var deferred = $.Deferred();

		$.when(openDb()).then(function() {

			var store = db.transaction(['lru'], 'readwrite').objectStore('lru');

			var storingRequest = store.put({ data: { data: data, timeout: Date.now() }, index: storeName + index, key: index, store: storeName });
			var lruGet = store.get('__lrudata' + storeName);
			lruGet.onsuccess = function(e) {
				var lru = e.target.result;
				if(!lru)
					lru = {};

				if(!lru.data)
					lru.data = {};

				if(!lru.data[index]) {
					lru['_count'] = 0 || lru['_count'] + 1;
				}
				
				lru.data[index] = Date.now();

				// We overflow the limit
				if(lru._count > lru._limit) {
					// We have to look for the oldest timestamp
					var time = Date.now(), oldestIndex;
					for(var i in lru.data) {
						if(lru.data[i] < time) {
							time = lru.data[i];
							oldestIndex = i;
						}
					}
			
					delete lru.data[oldestIndex];
					
					lru._count--;
					// The oldest index is now known
					var deleteRequest = store.delete(storeName + oldestIndex);
				}
				store.put({index: '__lrudata' + storeName, data: lru.data, store: storeName, key: '__lrudata', _count: lru._count, _limit: lru._limit });
			}
		
			deferred.resolve(data);
		}, function() {
			console.warn('IDB opening failure');
			deferred.reject();
		});

		return deferred;
	}

	function emptyDb(store) {
		db.transaction(['lru'], 'readwrite').objectStore('lru').delete(store);
	}

	return {

		useDb: function(dbtouse) {
			dbname = dbtouse;
		},

		create: function(store) {
			createStoreMemory(store);
			createStoreDB(store);
		},

		get: function(store, index) {
			var result;

			if((result = getFromMemory(store, index)) != undefined)
				return result;

			if((result = getFromDB(store, index)) != undefined)
				return result;
		},

		store: function(store, index, value) {

			// Storing goes into both memory and db
			storeInMemory(store, index, value);
			storeInDb(store, index, value); // Remember, this is asynchronous, but never mind, we don't need to wait to continue
			return value;
		},

		empty: function(store, memory, db) {
			if(memory)
				emptyMemory(store);

			if(db)
				emptyDb(store);
		},

		exists: function(store) {
			return (memory[store]);
		}
	}
});
