'use strict';

define(['jquery', 'src/util/util', 'src/main/datas', 'src/util/debug'], function ($, Util, Datas, Debug) {

    var allVariables = {};

    function unlisten(module) {
        var moduleId = module.getId();
        for (var i in allVariables) {
            allVariables[i].unlisten(moduleId);
        }
    }

    function getVariable(varName) {

        if (allVariables[varName]) {
            return allVariables[varName];
        }

        return newVariable(varName);
    }

    function newVariable(varName) {

        allVariables[varName] = new Variable(varName);
        return allVariables[varName];
    }

    function setVariable(name, jpath, newData, filter) {

        var variable = getVariable(name);
        var filterFunction = false;

        if (variable.killFilter) {
            variable.killFilter();
        }

        variable.killFilter = false;

        if (filter) {
            filterFunction = function (value, resolve, reject) {

                require([filter], function (filterFunction) {

                    if (filterFunction.kill) {

                        variable.killFilter = filterFunction.kill;
                    }

                    if (filterFunction.filter) {
                        return filterFunction.filter(value, resolve, reject);
                    }

                    reject('No filter function defined');
                });

            };
        }

        if (jpath) {
            return variable.setjPath(jpath, filterFunction);
        } else {
            return variable.createData([name], newData, filterFunction);
        }
    }

    function getNames() {
        return Object.keys(allVariables).sort();
    }

    function handleChange(event, moduleId) {
        if (event.jpath.length === 0) {
            return; // Direct change of data. Can happen with API.createData using undefined value
        }
        var eventJpath = event.jpath,
            el = eventJpath.length,
            variable, varJpath, i, j, l;
        loop1: for (i in allVariables) {
            variable = allVariables[i];
            varJpath = variable.getjPath();
            if (varJpath) {
                l = Math.min(varJpath.length, el);
                for (j = 0; j < l; j++) {
                    if (eventJpath[j] !== varJpath[j]) {
                        continue loop1;
                    }
                }
                variable.triggerChange(null, moduleId);
            }
        }
    }

    var data = new DataObject();
    data.onChange(handleChange);

    var Variable = function Variable(name) {

        var attributes = {
            writable: true,
            enumerable: false
        };

        Object.defineProperties(this, {
            '_name': attributes,
            '_jpath': attributes,
            '_value': attributes,
            'listenedBy': attributes,
            'listeners': attributes
        });

        this.defined = false;
        this.setName(name);
        this.listenedBy = {};
        this.listeners = [];
    };

    $.extend(true, Variable.prototype, {

        setName: function (name) {
            this._name = name;
        },

        getName: function () {
            return this._name;
        },

        isDefined: function () {
            return this.defined;
        },

        setjPath: function (jpath, callback) { // Reroute variable to some other place in the data
            if (typeof jpath === 'string') {
                jpath = jpath.split('.');
                jpath.shift();
            }

            var currentJpath = this._jpath;
            var same = true;
            if (currentJpath && jpath.length === currentJpath.length) {
                for (var i = 0; i < currentJpath.length; i++) {
                    if (String(currentJpath[i]) !== String(jpath[i])) {
                        same = false;
                        break;
                    }
                }
            } else {
                same = false;
            }

            if (!same) {
                return;
            }

            this._jpath = jpath;

            return this.triggerChange(callback);
        },


        getjPath: function () {
            return this._jpath;
        },


        createData: function (jpath, dataToCreate, callback) {
            dataToCreate = DataObject.resurrect(dataToCreate);
            var prom = data.setChild(jpath, dataToCreate);
            this.setjPath(jpath, callback);
            return prom.then(function () {
                return dataToCreate;
            });
        },

        getData: function () {
            return this._value;
        },

        setData: function (newData) { // CAUTION. This function will overwrite source data
            data.setChild(this.getjPath(), newData);
            this._setValue(newData);
            newData.triggerChange();
        },

        _setValue: function (value) {
            this._value = value;
            this.defined = true;
        },

        getValue: function () {
            return this._value;
        },

        listen: function (module, callback) {
            var id = module.getId();
            // If the module already listens for this variable, we should definitely not listen for it again.
            if (this.listenedBy[id]) {
                return;
            }

            this.listenedBy[id] = true;
            this.listeners.push({
                callback: callback,
                id: id
            });
        },

        unlisten: function (moduleId) {
            if (this.listenedBy[moduleId]) {
                delete this.listenedBy[moduleId];
                for (var i = 0, ii = this.listeners.length; i < ii; i++) {
                    if (this.listeners[i].id === moduleId) {
                        this.listeners.splice(i, 1);
                        break; // There should only be one listener per id, do not check further
                    }
                }
            }
        },

        triggerChange: function (callback, moduleId) {

            var that = this;

            if (this.rejectCurrentPromise) {

                this.rejectCurrentPromise('latency');
                this.rejectCurrentPromise = false;
            }

            this.currentPromise = new Promise(function (resolve, reject) {

                that.rejectCurrentPromise = reject;

                var _resolve = resolve,
                    _reject = reject;

                data.trace(that._jpath).then(function gotDataChild(value) {

                    if (callback) {

                        new Promise(function (resolve, reject) {

                            callback(value, resolve, reject);

                        })
                            .then(function (value) {

                                value = DataObject.check(value, true);
                                that._setValue(value);
                                _resolve(value);

                            }, function (error) {

                                Debug.warn('Error during variable filtering : ', error);
                                _reject('filter');

                            });

                    } else {

                        that._setValue(value);
                        _resolve(value);

                    }

                }, function (err) {
                    _reject(err);
                });
            });
            var prom = this.currentPromise.catch(function (err) {
                if (
                    err === 'filter' || // Already caught
                    err === 'latency' // Expected
                ) {
                    return;
                }
                Debug.error('Error in getting the variable through variable.js', err.stack || err);
            });

            for (var i = 0, l = that.listeners.length; i < l; i++) {
                if (that.listeners[i].id !== moduleId) {
                    that.listeners[i].callback.call(that, that);
                }
            }
            return prom;
        },

        onReady: function () {
            return this.currentPromise;
        }
    });

    return {
        getVariable: getVariable,
        setVariable: setVariable,
        getNames: getNames,
        getData: function () {
            return data;
        },
        exist: function (varName) {
            return allVariables.hasOwnProperty(varName);
        },
        unlisten: unlisten,
        eraseAll: function () {
            allVariables = {};
        }
    };

});
