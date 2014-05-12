/**
 * Promise polyfill v1.0.4
 * requires setImmediate
 *
 * © 2014 Dmitry Korobkin
 * Released under the MIT license
 * github.com/Octane/Promise
 */
(function () {'use strict';

    var global = new Function('return this')(),
        setImmediate = global.setImmediate;

    function toPromise(thenable) {
        if (isPromise(thenable)) {
            return thenable;
        }
        return new Promise(function (resolve, reject) {
            //execute thenable.then asynchronously
            //github.com/getify/native-promise-only/issues/5
            //github.com/domenic/promises-unwrapping/issues/105
            setImmediate(function () {
                try {
                    thenable.then(resolve, reject);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    function isPromise(anything) {
        return anything instanceof Promise;
    }

    function isThenable(anything) {
        return Object(anything) === anything &&
               'function' == typeof anything.then;
    }

    function isSettled(promise) {
        return promise._fulfilled || promise._rejected;
    }

    function allSettled(promises) {
        return promises.every(isSettled);
    }

    function defaultOnFulfilled(value) {
        return value;
    }

    function defaultOnRejected(reason) {
        throw reason;
    }

    function call(callback) {
        callback();
    }

    function Promise(resolver) {
        this._fulfilled = false;
        this._rejected = false;
        this._value = undefined;
        this._reason = undefined;
        this._onFulfilled = [];
        this._onRejected = [];
        this._resolve(resolver);
    }

    Promise.resolve = function (value) {
        if (isThenable(value)) {
            return toPromise(value);
        }
        return new Promise(function (resolve) {
            resolve(value);
        });
    };

    Promise.reject = function (reason) {
        return new Promise(function (resolve, reject) {
            reject(reason);
        });
    };

    Promise.race = function (promises) {
        return new Promise(function (resolve, reject) {
            promises.forEach(function (promise) {
                toPromise(promise).then(resolve, reject);
            });
        });
    };

    Promise.all = function (promises) {
        return new Promise(function (resolve, reject) {
            var values = [];
            promises = promises.map(toPromise);
            promises.forEach(function (promise, index) {
                promise.then(
                    function (value) {
                        values[index] = value;
                        if (allSettled(promises)) {
                            resolve(values);
                        }
                    },
                    reject
                );
            });
        });
    };

    Promise.prototype = {

        constructor: Promise,

        _resolve: function (resolver) {

            var promise = this;

            function resolve(value) {
                promise._fulfill(value);
            }

            function reject(reason) {
                promise._reject(reason);
            }

            try {
                resolver(resolve, reject);
            } catch(error) {
                if (!isSettled(promise)) {
                    reject(error);
                }
            }

        },

        _fulfill: function (value) {
            if (!isSettled(this)) {
                this._fulfilled = true;
                this._value = value;
                this._onFulfilled.forEach(call);
                this._clearQueue();
            }
        },

        _reject: function (reason) {
            if (!isSettled(this)) {
                this._rejected = true;
                this._reason = reason;
                this._onRejected.forEach(call);
                this._clearQueue();
            }
        },

        _enqueue: function (onFulfilled, onRejected) {
            this._onFulfilled.push(onFulfilled);
            this._onRejected.push(onRejected);
        },

        _clearQueue: function () {
            this._onFulfilled = [];
            this._onRejected = [];
        },

        then: function (onFulfilled, onRejected) {

            var promise = this;

            return new Promise(function (resolve, reject) {

                onFulfilled = onFulfilled || defaultOnFulfilled;
                onRejected = onRejected || defaultOnRejected;

                function asyncOnFulfilled() {
                    setImmediate(function () {
                        var value;
                        try {
                            value = onFulfilled(promise._value);
                        } catch (error) {
                            reject(error);
                            return;
                        }
                        if (isThenable(value)) {
                            toPromise(value).then(resolve, reject);
                        } else {
                            resolve(value);
                        }
                    });
                }

                function asyncOnRejected() {
                    setImmediate(function () {
                        var reason;
                        try {
                            reason = onRejected(promise._reason);
                        } catch (error) {
                            reject(error);
                            return;
                        }
                        if (isThenable(reason)) {
                            toPromise(reason).then(resolve, reject);
                        } else {
                            resolve(reason);
                        }
                    });
                }

                if (promise._fulfilled) {
                    asyncOnFulfilled();
                } else if (promise._rejected) {
                    asyncOnRejected();
                } else {
                    promise._enqueue(asyncOnFulfilled, asyncOnRejected);
                }

            });

        },

        'catch': function (onRejected) {
            return this.then(undefined, onRejected);
        }

    };

    if (typeof module != 'undefined' && module.exports) {
        module.exports = global.Promise || Promise;
    } else if (!global.Promise) {
        global.Promise = Promise;
    }

}());
