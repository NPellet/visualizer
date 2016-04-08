//

'use strict';

define(function () {

    function Storage(dbName) {
        this.dbName = 'kv-' + dbName;
        this.ready = new Promise((resolve, reject) => {
            var request = window.indexedDB.open(this.dbName);

            request.onupgradeneeded = e => {
                console.log('create object store');
                this.db = e.target.result;
                this.db.createObjectStore('store');

            };

            request.onsuccess = e => {
                console.log('on success');
                this.db = e.target.result;
                resolve();
            };

            request.onerror = e => {
                this.db = e.target.result;
                reject(e);
            };
        });
    }

    Storage.prototype.get = function (key) {
        return this.ready.then(() => {
            return new Promise((resolve, reject) => {
                var request = this.getStore().get(key);
                request.onsuccess = e => resolve(e.target.result);
                request.onerror = reject;
            });
        });
    };

    Storage.prototype.getStore = function () {
        return this.db
            .transaction(['store'], 'readwrite')
            .objectStore('store');
    };

    Storage.prototype.set = function (key, value) {
        return this.ready.then(() => {
            return new Promise((resolve, reject) => {
                var request = this.getStore().put(value, key);
                request.onsuccess = resolve;
                request.onerror = reject;
            });
        });
    };

    Storage.prototype.delete = function (key, value) {
        window.indexedDB.deleteDatabase(location.origin);
    };

    return Storage;

});
