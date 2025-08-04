// Based on https://gist.github.com/wilsonpage/01d2eb139959c79e0d9a

'use strict';

define(function () {
  function Storage(dbName) {
    this.dbName = `kv-${dbName}`;
    this.ready = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName);

      request.addEventListener('upgradeneeded', (e) => {
        const db = e.target.result;
        db.createObjectStore('store');
      });

      request.addEventListener('success', (e) => {
        this.db = e.target.result;
        resolve();
      });

      request.addEventListener('error', (e) => {
        this.db = e.target.result;
        reject(e);
      });
    });
  }

  Storage.prototype.get = function (key) {
    return this.ready.then(() => {
      return new Promise((resolve, reject) => {
        const request = this.getStore().get(key);
        request.addEventListener('success', (e) => resolve(e.target.result));
        request.addEventListener('error', reject);
      });
    });
  };

  Storage.prototype.getStore = function () {
    return this.db.transaction(['store'], 'readwrite').objectStore('store');
  };

  Storage.prototype.set = function (key, value) {
    return this.ready.then(() => {
      return new Promise((resolve, reject) => {
        const request = this.getStore().put(value, key);
        request.addEventListener('success', resolve);
        request.addEventListener('error', reject);
      });
    });
  };

  Storage.prototype.delete = function (key) {
    return this.ready.then(() => {
      return new Promise((resolve, reject) => {
        const request = this.getStore().delete(key);
        request.addEventListener('success', resolve);
        request.addEventListener('error', reject);
      });
    });
  };

  Storage.deleteDatabase = function (dbName) {
    window.indexedDB.deleteDatabase(dbName);
  };
  return Storage;
});
