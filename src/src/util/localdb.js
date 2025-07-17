'use strict';

define(['jquery'], function ($) {
  var db;

  return {
    open() {
      // In the following line, you should include the prefixes of implementations you want to test.
      // This condition should not be removed. Prevents error in firefox
      if (!('indexedDB' in window)) {
        window.indexedDB =
          window.indexedDB ||
          window.webkitIndexedDB ||
          window.mozIndexedDB ||
          window.oIndexedDB ||
          window.msIndexedDB;
      }
      // DON'T use 'var indexedDB = ...' if you're not in a function.
      // Moreover, you may need references to some window.IDB* objects:
      window.IDBTransaction =
        window.IDBTransaction ||
        window.webkitIDBTransaction ||
        window.msIDBTransaction;
      window.IDBKeyRange =
        window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
      // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

      var def = $.Deferred();
      if (!indexedDB) return def.reject();

      if (db) return def.resolve();

      var req = indexedDB.open('ci', 26);

      req.addEventListener('success', (e) => {
        db = e.target.result;
        def.resolve();
      });

      req.addEventListener('upgradeneeded', (e) => {
        db = e.target.result;
        if (db.objectStoreNames.contains('localview')) {
          db.deleteObjectStore('localview');
        }

        if (db.objectStoreNames.contains('localdata')) {
          db.deleteObjectStore('localdata');
        }

        db.createObjectStore('localdata', { keyPath: 'readURL' });
        db.createObjectStore('localview', { keyPath: 'readURL' });

        def.resolve();
      });

      req.addEventListener('error', (e) => {
        def.reject(e);
      });

      return def;
    },

    getAll(type, key, branch) {
      var def = $.Deferred();

      type =
        type === 'data' || type === 'localdata' ? 'localdata' : 'localview';

      var trans = db.transaction([type], 'readwrite');
      var store = trans.objectStore(type);
      var stack = {};

      var req;
      if (branch) {
        req = store.get(`${key};${branch}`);
      } else {
        req = store.openCursor();
      }

      req.addEventListener('success', (e) => {
        // If there is none, let's create it

        if (branch) {
          if (e.target.result == undefined) {
            this.create(type, key, branch).pipe((obj) => {
              def.resolve(obj);
            });
          } else {
            def.resolve(e.target.result);
          }
        } else {
          if (e.target.result && e.target.result.key.includes(key)) {
            stack[e.target.result.value.branch] = e.target.result.value;
          }

          if (e.target.result) {
            e.target.result.continue();
          } else {
            def.resolve(stack);
          }
        }
      });

      req.addEventListener('error', (e) => {
        def.reject(e);
      });

      return def;
    },

    create(type, key, branch) {
      // Create empty head, empty list

      var obj = {
        readURL: `${key};${branch}`,
        url: key,
        branch,
        list: [],
        head: '{}',
      };

      var def = $.Deferred();

      type =
        type === 'data' || type === 'localdata' ? 'localdata' : 'localview';
      var trans = db.transaction(type, 'readwrite');
      var store = trans.objectStore(type);
      var req = store.put(obj);

      req.onsuccess = function () {
        def.resolve(obj);
      };

      return def;
    },

    storeToHead(type, key, branch, obj) {
      var def = $.Deferred();

      type =
        type === 'data' || type === 'localdata' ? 'localdata' : 'localview';
      var trans = db.transaction(type, 'readwrite');
      var store = trans.objectStore(type);

      var req = store.get(`${key};${branch}`);
      req.addEventListener('success', (e) => {
        if (e.target.result) {
          var obj2 = e.target.result;
          obj2.head = JSON.stringify(obj);
          var req2 = store.put(obj2);
          req2.addEventListener('success', () => {
            def.resolve(obj);
          });
        } else {
          this.create(type, key, branch).done(() => {
            this.storeToHead(type, key, branch, obj).done(() => {
              def.resolve(obj);
            });
          });
        }
      });
      return def;
    },

    store(type, key, branch, obj) {
      var def = $.Deferred();
      type =
        type === 'data' || type === 'localdata' ? 'localdata' : 'localview';
      var trans = db.transaction(type, 'readwrite');

      var store = trans.objectStore(type);

      var req = store.get(`${key};${branch}`);
      obj = JSON.stringify(obj);

      req.onsuccess = function (e) {
        if (e.target.result == null) {
          // Ok here we have a new branch => Save to the head.
          db.create(type, key, branch).done(function (resulted) {
            var trans = db.transaction(type, 'readwrite');
            var store = trans.objectStore(type);
            resulted.head = obj;
            var req2 = store.put(resulted);
            req2.onsuccess = function () {
              def.resolve(obj);
            };
          });
        } else {
          var obj2 = e.target.result;
          obj2.list.push(obj);
          var req2 = store.put(obj2);
          req2.onsuccess = function () {
            def.resolve(obj);
          };
        }
      };
      return def;
    },

    getHead(type, key, branch) {
      return this.open().pipe(() => {
        return this.getAll(type, key, branch).pipe((obj) => {
          return obj.head;
        });
      });
    },

    getList(type, key, branch) {
      return db.getAll(type, key, branch).pipe((obj) => {
        return obj.list;
      });
    },
  };
});
