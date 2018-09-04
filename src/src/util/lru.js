'use strict';

// LRU
define(['jquery', 'src/util/debug'], function ($, Debug) {
  var indexedDB, IDBTransaction, IDBKeyRange;
  var db,
    dbname = 'cilru';

  function createStoreDB(store, limit) {
    var storeName = store;
    var deferred = $.Deferred();

    $.when(openDb()).then(
      function () {
        var store = db.transaction(['lru'], 'readwrite').objectStore('lru');
        var lruGet = store.get(`__lrudata${storeName}`);

        lruGet.onsuccess = function (e) {
          var lru = e.target.result;
          var toStore = {
            index: `__lrudata${storeName}`,
            data: {},
            store: storeName,
            _count: 0,
            _limit: limit
          };
          if (lru) {
            toStore.data = lru.data;
            toStore._count = lru._count;
            if (!limit) toStore._limit = lru._limit;
          }
          var req = store.put(toStore);
          req.onsuccess = function (e) {
            Debug.info('success storing store', e);
            deferred.resolve();
          };
          req.onerror = function (e) {
            Debug.error(`error storing store ${storeName}`, e);
            deferred.reject();
          };
        };
      },
      function () {
        Debug.warn('IDB opening failure');
        deferred.reject();
      }
    );

    return deferred;
  }

  function openDb() {
    var ready = $.Deferred();

    if (!dbname) return ready.reject('No database to use');

    if (db) return ready.resolve(db);

    // Store references from cross compatibility
    indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB;
    IDBTransaction =
      window.IDBTransaction ||
      window.webkitIDBTransaction ||
      window.msIDBTransaction;
    IDBKeyRange =
      window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    if (!indexedDB) {
      ready.reject();
      return ready;
    }

    var openrequest = indexedDB.open(dbname, 2);

    // Database is open
    openrequest.onsuccess = function (e) {
      db = e.target.result;
      ready.resolve();
    };

    openrequest.onerror = function (e) {
      Debug.info(e);
      ready.reject();
    };

    openrequest.onupgradeneeded = function (e) {
      db = e.target.result;
      switch (e.oldVersion) {
        case 0:
          if (db.objectStoreNames.contains('lru')) return;
          var objectStore = db.createObjectStore('lru', { keyPath: 'index' });
          objectStore.createIndex('key', 'key', { unique: true });
          objectStore.createIndex('store', 'store', { unique: false });
        case 1: // eslint-disable-line no-fallthrough
          if (!objectStore)
            objectStore = e.currentTarget.transaction.objectStore('lru');
          objectStore.deleteIndex('key');
      }
    };

    return ready;
  }

  function getFromDB(storeName, index) {
    var deferred = $.Deferred();

    $.when(openDb()).then(
      function () {
        var store = db.transaction('lru', 'readwrite').objectStore('lru'),
          getter = store.get(storeName + index),
          defGet = $.Deferred();

        getter.onsuccess = function (e) {
          if (e.target.result) defGet.resolve(e.target.result.data);
          else defGet.reject();
        };

        var getStore = store.get(`__lrudata${storeName}`);
        getStore.onsuccess = function (e) {
          var lru = e.target.result;
          if (!lru) return;

          if (lru.data[index]) {
            lru.data[index] = Date.now(); // Update the date of the object
            var setter = store.put(lru);

            setter.onsuccess = function (event) {
              Debug.info("success update resource's timestamp");
            };
          }
        };

        $.when(defGet).then(
          function (data) {
            // A getter from the db must trigger a setter in the memory
            deferred.resolve(data);
          },
          function () {
            deferred.reject();
          }
        );
      },
      function () {
        Debug.warn('IDB opening failure');
        deferred.reject();
      }
    );

    return deferred;
  }

  function storeInDb(store, index, data) {
    var storeName = store;
    var deferred = $.Deferred();

    $.when(openDb()).then(
      function () {
        var store = db.transaction(['lru'], 'readwrite').objectStore('lru');

        var storingRequest = store.put({
          data: {
            data: data,
            timeout: Date.now()
          },
          index: storeName + index,
          store: storeName
        });

        storingRequest.onsuccess = function (e) {
          Debug.info('success storing data', e);
        };
        storingRequest.onerror = function (e) {
          Debug.error('error storing data', e);
        };
        var lruGet = store.get(`__lrudata${storeName}`);
        lruGet.onsuccess = function (e) {
          var lru = e.target.result;
          if (!lru) lru = {};

          if (!lru.data) lru.data = {};

          if (!lru.data[index]) {
            lru._count += 1;
          }

          lru.data[index] = Date.now();

          // We overflow the limit
          if (lru._count > lru._limit) {
            // We have to look for the oldest timestamps
            var keys = Object.keys(lru.data);
            keys.sort(function (a, b) {
              // a goes first if timestamp smaller
              if (lru.data[a] < lru.data[b]) {
                return -1;
              } else if (lru.data[a] > lru.data[b]) {
                return 1;
              } else {
                return 0;
              }
            });

            for (var i = 0; i < lru._count - lru._limit; i++) {
              delete lru.data[keys[i]];
              store.delete(storeName + keys[i]);
            }
            lru._count = lru._limit;
          }
          store.put({
            index: `__lrudata${storeName}`,
            data: lru.data,
            store: storeName,
            _count: lru._count,
            _limit: lru._limit
          });
        };

        deferred.resolve(data);
      },
      function () {
        Debug.warn('IDB opening failure');
        deferred.reject();
      }
    );

    return deferred;
  }

  function emptyDb(store) {
    db.transaction(['lru'], 'readwrite')
      .objectStore('lru')
      .delete(store);
  }

  return {
    create: function (store, limit) {
      createStoreDB(store, limit);
    },

    get: function (store, index) {
      return getFromDB(store, index);
    },

    store: function (store, index, value) {
      storeInDb(store, index, value); // Remember, this is asynchronous, but never mind, we don't need to wait to continue
      return value;
    },

    empty: function (store) {
      emptyDb(store);
    }
  };
});
