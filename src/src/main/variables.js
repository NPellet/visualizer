'use strict';

define([
  'jquery',
  'src/util/util',
  'src/main/datas',
  'src/util/debug'
], function ($, Util, Datas, Debug) {
  var data = new DataObject();
  data.onChange(handleChange);

  var allVariables = new Map();

  class Variable {
    constructor(name) {
      this._name = name;
      this._jpath = null;
      this._value = null;
      this._filter = null;
      this._listenedBy = new Set();
      this._listeners = [];
      this._defined = false;
      this._upToDate = true;
      this._killFilter = null;
    }

    getName() {
      return this._name;
    }

    isDefined() {
      return this._defined;
    }

    setFilter(filterName) {
      if (this._filter !== filterName) {
        this._filter = filterName;
        this._upToDate = false;
      }
    }

    setjPath(jpath) {
      // Reroute variable to some other place in the data
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
        this._jpath = jpath;
        this._upToDate = false;
      }

      return this.update();
    }

    update() {
      if (!this._upToDate) {
        if (this._killFilter) {
          this._killFilter();
        }

        this._killFilter = null;

        let callback = null;
        if (this._filter) {
          const filter = this._filter;
          callback = (value, resolve, reject) => {
            require([filter], (filterFunction) => {
              if (typeof filterFunction.kill === 'function') {
                this._killFilter = filterFunction.kill;
              }

              if (typeof filterFunction.filter === 'function') {
                return filterFunction.filter(value, resolve, reject);
              }

              reject(new Error('No filter function defined'));
            });
          };
        }

        this._upToDate = true;
        return this.triggerChange(callback);
      }
    }

    getjPath() {
      return this._jpath;
    }

    createData(jpath, dataToCreate) {
      dataToCreate = Datas.resurrect(dataToCreate);
      return data.setChild(jpath, dataToCreate).then(() => {
        this._upToDate = false;
        return this.setjPath(jpath);
      });
    }

    getData() {
      return this._value;
    }

    setData(newData) {
      // CAUTION. This function will overwrite source data
      newData = Datas.resurrect(newData);
      return data.setChild(this.getjPath(), newData).then(() => {
        this._upToDate = false;
        this.update();
      });
    }

    _setValue(value) {
      this._value = value;
      this._defined = true;
    }

    getValue() {
      return this._value;
    }

    listen(module, callback) {
      var id = module.getId();
      // If the module already listens for this variable, we should definitely not listen for it again.
      if (!this._listenedBy.has(id)) {
        this._listeners.push({
          callback: callback,
          id: id
        });
        this._listenedBy.add(id);
      }
    }

    unlisten(moduleId) {
      if (this._listenedBy.has(moduleId)) {
        for (var i = 0, ii = this._listeners.length; i < ii; i++) {
          if (this._listeners[i].id === moduleId) {
            this._listeners.splice(i, 1);
            break; // There should only be one listener per id, do not check further
          }
        }
        this._listenedBy.delete(moduleId);
      }
    }

    triggerChange(callback, moduleId) {
      if (this.rejectCurrentPromise) {
        this.rejectCurrentPromise(new Error('latency')); // todo remove this hack
        this.rejectCurrentPromise = false;
      }

      this.currentPromise = new Promise((resolve, reject) => {
        this.rejectCurrentPromise = reject;

        const _resolve = resolve;
        const _reject = reject;

        data.trace(this._jpath).then(
          (value) => {
            if (callback) {
              new Promise((resolve, reject) => {
                callback(value, resolve, reject);
              }).then(
                (value) => {
                  value = DataObject.check(value, true);
                  _resolve(value);
                },
                (error) => {
                  Debug.warn('Error during variable filtering : ', error);
                  _reject(new Error('filter')); // todo remove this hack
                }
              );
            } else {
              _resolve(value);
            }
            return null;
          },
          (err) => {
            _reject(err);
          }
        );

        return null;
      }).then((value) => {
        this._setValue(value);
        return value;
      });
      var prom = this.currentPromise.catch((err) => {
        if (
          err.message === 'filter' || // Already caught
          err.message === 'latency' // Expected
        ) {
          return;
        }
        Debug.error(
          'Error in getting the variable through variable.js',
          err.stack || err
        );
      });

      for (var i = 0, l = this._listeners.length; i < l; i++) {
        if (this._listeners[i].id !== moduleId) {
          this._listeners[i].callback.call(this, this);
        }
      }
      return prom;
    }

    onReady() {
      return this.currentPromise;
    }
  }

  function unlisten(module) {
    var moduleId = module.getId();
    for (var variable of allVariables.values()) {
      variable.unlisten(moduleId);
    }
  }

  function getVariable(varName) {
    if (allVariables.has(varName)) {
      return allVariables.get(varName);
    }
    return newVariable(varName);
  }

  function newVariable(varName) {
    const variable = new Variable(varName);
    allVariables.set(varName, variable);
    return variable;
  }

  function setVariable(name, jpath, newData, filter) {
    var variable = getVariable(name);

    variable.setFilter(filter || null);

    if (jpath) {
      return variable.setjPath(jpath);
    } else {
      return variable.createData([name], newData);
    }
  }

  function getNames() {
    return Array.from(allVariables.keys()).sort();
  }

  function handleChange(event, moduleId) {
    if (event.jpath.length === 0) {
      return; // Direct change of data. Can happen with API.createData using undefined value
    }
    var eventJpath = event.jpath;
    var el = eventJpath.length;
    var varJpath, j, l;
    loop1: for (var variable of allVariables.values()) {
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

  return {
    getVariable: getVariable,
    setVariable: setVariable,
    getNames: getNames,
    getData: function () {
      return data;
    },
    exist: function (varName) {
      return allVariables.has(varName);
    },
    unlisten: unlisten,
    eraseAll: function () {
      allVariables = new Map();
    }
  };
});
