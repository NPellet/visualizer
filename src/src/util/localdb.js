'use strict';

define(['jquery'], function ($) {
  let db;

  return {
    open() {
      const def = $.Deferred();

      if (db) return def.resolve();

      const req = indexedDB.open('ci', 26);

      req.addEventListener('upgradeneeded', (e) => {
        const db = e.target.result;
        if (db.objectStoreNames.contains('localview')) {
          db.deleteObjectStore('localview');
        }

        if (db.objectStoreNames.contains('localdata')) {
          db.deleteObjectStore('localdata');
        }

        db.createObjectStore('localdata', { keyPath: 'readURL' });
        db.createObjectStore('localview', { keyPath: 'readURL' });
      });

      req.addEventListener('success', (e) => {
        db = e.target.result;
        def.resolve();
      });

      req.addEventListener('error', (e) => {
        def.reject(e);
      });

      return def;
    },

    getAll(type, key, branch) {
      const def = $.Deferred();

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
            this.create(type, key, branch).then((obj) => {
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

      const def = $.Deferred();

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
      const def = $.Deferred();

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
      const def = $.Deferred();
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
      return this.open().then(() => {
        return this.getAll(type, key, branch).then((obj) => {
          return obj.head;
        });
      });
    },

    getList(type, key, branch) {
      return db.getAll(type, key, branch).then((obj) => {
        return obj.list;
      });
    },
  };
});
