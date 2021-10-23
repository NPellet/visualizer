'use strict';

define(['src/util/util', 'src/util/debug', 'src/util/urldata'], function (
  Util,
  Debug,
  urlData
) {
  function DataObject(object) {
    if (!object) {
      return;
    }

    for (var i in object) {
      if (object.hasOwnProperty(i)) {
        object[i] = DataObject.check(object[i]);
      }
    }

    DataObject.check(object);

    return object;
  }
  var DataObjectProto = DataObject.prototype;

  DataObject.check = function (object, transformNatives) {
    var currentProto, nextProto;
    if (isSpecialObject(object)) {
      return object;
    } else if (Array.isArray(object)) {
      currentProto = object;
      while (currentProto !== DataArrayProto) {
        nextProto = Object.getPrototypeOf(currentProto);
        if (
          nextProto === null ||
          (nextProto.constructor &&
            (nextProto.constructor === Array ||
              nextProto.constructor.name === 'Array'))
        ) {
          Object.setPrototypeOf(currentProto, DataArrayProto);
          break;
        }
        currentProto = nextProto;
      }
      return object;
    } else if (object === null) {
      return null;
    } else {
      var type = typeof object;

      if (type === 'object') {
        currentProto = object;
        while (currentProto !== DataObjectProto) {
          // eslint-disable-line no-constant-condition
          nextProto = Object.getPrototypeOf(currentProto);
          if (
            nextProto === null ||
            (nextProto.constructor &&
              (nextProto.constructor === Object ||
                nextProto.constructor.name === 'Object'))
          ) {
            Object.setPrototypeOf(currentProto, DataObjectProto);
            break;
          }
          currentProto = nextProto;
        }
        return object;
      }

      if (!transformNatives) {
        return object;
      }

      return transformNative(object);
    }
  };

  DataObject.resurrect = function (obj) {
    if (isSpecialObject(obj)) {
      return obj.resurrect();
    }
    return obj;
  };

  DataObject.recursiveTransform = function (object, transformNatives) {
    object = DataObject.check(object, transformNatives);
    var i, l;

    if (Array.isArray(object)) {
      for (i = 0, l = object.length; i < l; i++) {
        object[i] = DataObject.check(object[i], transformNatives);
        DataObject.recursiveTransform(object[i], transformNatives);
      }
    } else if (object instanceof Object) {
      for (i in object) {
        object[i] = DataObject.check(object[i], transformNatives);
        DataObject.recursiveTransform(object[i], transformNatives);
      }
    }

    return object;
  };

  function duplicate(object) {
    var type = typeof object;
    if (
      type === 'number' ||
      type === 'string' ||
      type === 'boolean' ||
      object === null
    ) {
      return object;
    } else if (type === 'undefined' || type === 'function') {
      return;
    }

    var target, i, l;

    if (isSpecialNativeObject(object)) {
      return transformNative(object);
    } else if (Array.isArray(object)) {
      l = object.length;
      target = new Array(l);
      if (isDataArray(object)) {
        target = DataArray(target);
      }
      for (i = 0; i < l; i++) {
        target[i] = duplicate(object[i]);
      }
    } else {
      var keys = Object.keys(object);
      l = keys.length;
      if (isDataObject(object)) {
        target = new DataObject();
      } else {
        target = {};
      }
      for (i = 0; i < l; i++) {
        target[keys[i]] = duplicate(object[keys[i]]);
      }
    }

    return target;
  }

  var duplicator = {
    value: function () {
      return duplicate(this);
    }
  };

  function DataString(s) {
    Object.defineProperty(this, 's_', {
      value: String(s),
      writable: true
    });
  }

  DataString.cast = function (value) {
    return String(value);
  };

  var StringProperties = [
    'charAt',
    'charCodeAt',
    'codePointAt',
    'concat',
    'includes',
    'endsWith',
    'indexOf',
    'lastIndexOf',
    'localeCompare',
    'match',
    'normalize',
    'repeat',
    'replace',
    'search',
    'slice',
    'split',
    'startsWith',
    'substr',
    'substring',
    'toLocaleLowerCase',
    'toLocaleUpperCase',
    'toLowerCase',
    'toUpperCase',
    'trim'
  ];

  for (var i = 0, l = StringProperties.length; i < l; i++) {
    (function (j) {
      DataString.prototype[StringProperties[j]] = function () {
        return String.prototype[StringProperties[j]].apply(this.s_, arguments);
      };
    })(i);
  }

  DataString.prototype.getType = function () {
    return 'string';
  };

  DataString.prototype.nativeConstructor = String;

  function DataNumber(s) {
    Object.defineProperty(this, 's_', {
      value: Number(s),
      writable: true
    });
  }

  DataNumber.cast = function (value) {
    return Number(value);
  };

  DataNumber.prototype.getType = function () {
    return 'number';
  };

  DataNumber.prototype.nativeConstructor = Number;

  function DataBoolean(s) {
    Object.defineProperty(this, 's_', {
      value: Boolean(s),
      writable: true
    });
  }

  DataBoolean.cast = function (value) {
    if (value instanceof DataBoolean) {
      return value.s_;
    }
    return Boolean(value);
  };

  DataBoolean.prototype.getType = function () {
    return 'boolean';
  };

  DataBoolean.prototype.nativeConstructor = Boolean;

  window.DataString = DataString;
  window.DataNumber = DataNumber;
  window.DataBoolean = DataBoolean;

  function DataArray(arr, recursive, forceCopy) {
    var newArr = [];
    if (arr) {
      if (!Array.isArray(arr))
        throw new Error('DataArray can only be constructed from arrays');
      for (var i = 0, l = arr.length; i < l; i++) {
        if (recursive) {
          newArr[i] = DataObject.check(arr[i], recursive, forceCopy);
        } else {
          newArr[i] = arr[i];
        }
      }
    }
    Object.setPrototypeOf(newArr, DataArrayProto);
    return newArr;
  }

  var DataArrayProto = (DataArray.prototype = Object.create(Array.prototype));
  Object.defineProperty(DataArrayProto, 'constructor', { value: DataArray });

  window.DataObject = DataObject;
  window.DataArray = DataArray;

  var resurrectObject = {
    value: function () {
      var obj = {};

      var enumerableKeys = Object.keys(this);
      var ownKeys = Object.getOwnPropertyNames(this).filter((key) => !key.startsWith('__'));
      var keys = enumerableKeys.concat(ownKeys);
      keys = keys.filter((item, pos) => keys.indexOf(item) === pos);

      for (var i of keys) {
        if (isSpecialObject(this[i])) {
          obj[i] = this[i].resurrect();
        } else {
          obj[i] = this[i];
        }
      }
      return obj;
    }
  };

  var resurrectArray = {
    value: function () {
      var obj = [];
      for (var i = 0, l = this.length; i < l; i++) {
        if (isSpecialObject(this[i])) {
          obj[i] = this[i].resurrect();
        } else {
          obj[i] = this[i];
        }
      }
      return obj;
    }
  };

  var dataGetter = {
    value: function (prop, returnPromise, constructor) {
      function processVal(val) {
        if (typeof val !== 'object' || val === null) return val;
        if (typeof val[prop] !== 'undefined') {
          dataObjectify(val, prop);
          if (isDataObject(val[prop])) {
            return val[prop].fetch(true);
          } else {
            return val[prop];
          }
        } else if (constructor) {
          val[prop] = new constructor();
          return val[prop];
        }
      }

      // Looking for this[ prop ]
      if (typeof prop === 'string' || typeof prop === 'number') {
        if (returnPromise) {
          // Returns a promise if asked
          return this.get(true).then(processVal);
        } else {
          var val = this.get(); // Current value

          if (typeof val !== 'object' || val === null) return val;
          if (typeof val[prop] !== 'undefined') {
            return dataObjectify(val, prop);
          } else if (constructor) {
            val[prop] = new constructor();
            return val[prop];
          }
          return val[prop];
        }
      } else {
        if (prop === true) {
          if (this.hasOwnProperty('type') && this.hasOwnProperty('value')) {
            return Promise.resolve(dataObjectify(this, 'value'));
          } else if (
            this.hasOwnProperty('type') &&
            this.hasOwnProperty('url')
          ) {
            return this.fetch(true).then(function (self) {
              return self.get();
            });
          } else {
            return Promise.resolve(this);
          }
        } else {
          if (this.hasOwnProperty('value') && this.hasOwnProperty('type'))
            return dataObjectify(this, 'value');
          return this;
        }
      }
    }
  };

  function dataObjectify(parent, prop) {
    if (!isSpecialObject(parent[prop])) {
      parent[prop] = DataObject.check(parent[prop], true);
    }
    return parent[prop];
  }

  var dataSetter = {
    value: function (prop, value, noTrigger) {
      var valueTyped = DataObject.check(value, true);
      var self = this.get();

      var current = self[prop];

      if (!valueTyped) {
        self[prop] = valueTyped;
      } else {
        var type = valueTyped.getType();

        self[prop] = DataObject.check(self[prop], true);

        var typeNow =
          self[prop] != undefined && self[prop].getType
            ? self[prop].getType()
            : undefined;

        if (typeNow !== type) {
          self[prop] = valueTyped;
        } else if (
          isSpecialNativeObject(self[prop]) ||
          isTypedObject(self[prop])
        ) {
          // Keep current listeners
          var listeners = self[prop]._dataChange;
          // Replace entire value so that special properties (_highlight ...) can be changed
          self[prop] = valueTyped;
          self[prop].linkToParent(this, prop);
          self[prop]._dataChange = listeners;
          if (!noTrigger) {
            self[prop].triggerChange();
            noTrigger = true;
          }
        } else if (valueTyped !== self[prop]) {
          self[prop] = valueTyped;
        }
      }
      if (!noTrigger) {
        this.triggerChange(false, []);
      }

      if (current) {
        delete current.__parent;
        delete current.__name;
        delete current._dataChange;
      }

      return self[prop];
    }
  };

  const getChild = {
    value: async function (jpath) {
      if (typeof jpath === 'string') {
        // Old version
        jpath = jpath.split('.');
        jpath.shift();
      }

      if (!jpath || jpath.length === 0) {
        return this;
      }

      jpath = jpath.slice();

      const el = jpath.shift();
      let subEl = await this.get(el, true);

      subEl = DataObject.check(subEl, true);
      if (!subEl || jpath.length === 0) {
        return subEl;
      } else {
        return subEl.getChild(jpath);
      }
    }
  };

  const trace = {
    value: async function (jpath) {
      if (jpath && jpath.split) {
        jpath = jpath.split('.');
        jpath.shift();
      }

      if (!jpath || jpath.length === 0) {
        return this;
      }

      jpath = jpath.slice();

      const el = jpath.shift();
      var subEl = await this.get(el, true);
      if (typeof subEl !== 'undefined') {
        if (subEl && subEl.linkToParent) {
          subEl.linkToParent(this, el);
        }
        if (!subEl || jpath.length === 0) {
          return subEl;
        }
        return subEl.trace(jpath);
      }
      return subEl;
    }
  };

  var traceSync = {
    value: function (jpath) {
      return this.getChildSync(jpath, true);
    }
  };

  var getChildSync = {
    value: function (jpath, setParents) {
      if (typeof jpath === 'string') {
        // Old version
        jpath = jpath.split('.');
        jpath.shift();
      }

      if (!jpath) {
        return;
      }

      jpath = jpath.slice();

      var el = jpath.shift(); // Gets the current element and removes it from the array
      var subEl = this.get(el);

      if (subEl == null) {
        return;
      }

      if (setParents) {
        subEl.linkToParent(this, el);
      }

      if (jpath.length === 0) {
        return subEl;
      }

      return subEl.getChildSync(jpath, setParents);
    }
  };

  var linkToParent = {
    value: function (parent, name) {
      if (this.__parent) {
        return;
      }

      Object.defineProperty(this, '__parent', {
        value: parent,
        writable: false,
        configurable: true,
        enumerable: false
      });
      Object.defineProperty(this, '__name', {
        value: name,
        writable: false,
        configurable: true,
        enumerable: false
      });
    }
  };

  var setChild = {
    value: function (jpath, newValue, triggerParams, constructor) {
      var that = this;

      if (typeof jpath === 'string') {
        // Old version
        Debug.warn('Using jpath strings is deprecated');
        jpath = jpath.split('.');
        jpath.shift();
      }

      jpath = jpath.slice();

      var jpathLength = jpath.length;

      if (jpathLength === 0) {
        throw new Error('setChild cannot be called with an empty jPath');
      }

      var el = jpath.shift();

      if (jpathLength === 1) {
        var res = that.set(el, newValue, true); // noTrigger
        if (res && res.linkToParent) {
          res.linkToParent(that, el);
          res.triggerChange(false, triggerParams);
        } else {
          that.triggerChange(false, triggerParams, el, res);
        }
        return Promise.resolve();
      }

      var elementType =
        jpath.length === 0
          ? constructor
          : typeof jpath[0] === 'number'
            ? DataArray
            : DataObject;

      var name = el;

      var args = [jpath, newValue, triggerParams, constructor];

      return this.get(el, true, elementType).then(function (val) {
        that.set(name, val, true);
        val.linkToParent(that, name);
        val.setChild(...args);
      });
    }
  };

  var setChildSync = {
    value: function (jpath, newValue, triggerParams, constructor) {
      var that = this;

      if (typeof jpath === 'string') {
        // Old version
        Debug.warn('Using jpath strings is deprecated');
        jpath = jpath.split('.');
        jpath.shift();
      }

      jpath = jpath.slice();

      var jpathLength = jpath.length;

      if (jpathLength === 0) {
        throw new Error('setChild cannot be called with an empty jPath');
      }

      var el = jpath.shift();

      if (jpathLength === 1) {
        var res = that.set(el, newValue, true);
        if (res && res.linkToParent) {
          res.linkToParent(that, el);
          res.triggerChange(false, triggerParams);
        } else {
          that.triggerChange(false, triggerParams);
        }
        return;
      }

      var elementType =
        jpath.length === 0
          ? constructor
          : typeof jpath[0] === 'number'
            ? DataArray
            : DataObject;

      var name = el;

      var args = [jpath, newValue, triggerParams, constructor];

      var val = this.get(el, false, elementType);
      this.set(name, val, true);
      val.linkToParent(that, name);
      val.setChildSync(...args);
    }
  };

  var triggerBubble = {
    value: function (args) {
      if (this._dataChange) {
        for (var i in this._dataChange) {
          this._dataChange[i].apply(this, args);
        }
      }

      if (this.type && this.url && this.hasOwnProperty('value')) {
        delete this.url;
        Object.defineProperty(this, 'value', {
          enumerable: true
        });
      }

      if (!this.__parent) {
        return;
      }

      args[0].jpath.unshift(this.__name);

      this.__parent._triggerBubble(args);
    }
  };

  // 2 June 2014
  // In order to prevent looping, the trigger and bind change should only be called via the module model.

  var triggerChange = {
    value: function (noBubble, args, jpath, target) {
      if (!Array.isArray(args)) {
        if (args == undefined) {
          args = [];
        } else {
          args = [args];
        }
      }

      if (jpath) {
        args.unshift({
          target: target,
          jpath: [jpath]
        });
      } else {
        args.unshift({
          target: this,
          jpath: []
        });
      }

      if (this._dataChange) {
        for (var i in this._dataChange) {
          this._dataChange[i].apply(this, args);
        }
      }

      if (this.type && this.url && this.hasOwnProperty('value')) {
        delete this.url;
        Object.defineProperty(this, 'value', {
          enumerable: true
        });
      }

      if (noBubble) {
        return;
      }

      if (!this.__parent) {
        return;
      }

      args[0].jpath.unshift(this.__name);

      this.__parent._triggerBubble(args);
    }
  };

  var bindChange = {
    value: function (callback) {
      if (!this._dataChange) {
        Object.defineProperty(this, '_dataChange', {
          value: {},
          enumerable: false,
          writable: true,
          configurable: true
        });
      }

      var id = Util.getNextUniqueId(true);
      this._dataChange[id] = callback;
      callback.id = id;

      return id;
    }
  };

  var unbindChange = {
    value: function (idOrFunc) {
      if (!this._dataChange) {
        Debug.info('Could not unbind event. No listener for this object');
        return false;
      }

      if (idOrFunc.id) {
        idOrFunc = idOrFunc.id;
      }

      delete this._dataChange[idOrFunc];
    }
  };

  var getType = {
    value: function () {
      var type = Util.objectToString(this).toLowerCase();
      if (type !== 'object')
        // Native types: number, string, boolean
        return type;
      if (Array.isArray(this)) return 'array';
      if (isTypedObject(this)) return this.type;
      return type;
    }
  };

  DataObject.getType = function (value) {
    if (isSpecialObject(value)) {
      return value.getType();
    } else {
      return Util.objectToString(value).toLowerCase();
    }
  };

  var fetch = {
    value: function (forceJson) {
      if (!this.url || !this.type || this.hasOwnProperty('value')) {
        // No need for fetching. Still returning a promise, though.
        return Promise.resolve(this);
      }

      if (this._fetching) {
        return this._fetching;
      }

      var headers;
      if (forceJson) {
        headers = {
          Accept: 'application/json'
        };
      }

      this._fetching = urlData.get(this.url, false, this.timeout, headers, {
        withCredentials: this.withCredentials,
      }).then(
        (data) => {
          delete this._fetching;
          data = DataObject.check(data, true); // Transform the input into a DataObject

          Object.defineProperty(this, 'value', {
            // Sets the value to the object
            enumerable: this._keep || false, // If this._keep is true, then we will save the fetched data
            writable: true,
            configurable: true,
            value: data
          });

          return this;
        },
        (err) => {
          delete this._fetching;
          Debug.debug(`Could not fetch ${this.url} (${err})`);
          throw err;
        }
      );

      return this._fetching;
    }
  };

  /*
   * Performs a deep merge of an object into another.Properties of the from object will overwrite those of the to object.
   * Result is different from jQuery.extend in the way that arrays are completely overwritten
   */
  function merge(to, from) {
    for (var i in from) {
      var el = from[i];
      if (typeof el === 'object') {
        if (Array.isArray(el)) {
          var toEl = to.get(i);
          if (!(toEl instanceof DataArray)) {
            toEl = new DataArray();
            to.set(i, toEl, true);
          }
          for (let j = 0; j < el.length; j++) {
            var value = el[j];
            var toValue = toEl[j];
            if (value === undefined && toValue !== undefined) continue;
            if (typeof value !== 'object' || isSpecialNativeObject(value)) {
              toEl.set(j, value);
            } else if (
              typeof toValue !== 'object' ||
              isSpecialNativeObject(toValue)
            ) {
              toEl.set(j, value);
            } else {
              merge(toEl.get(j), value);
            }
          }
        } else if (el !== null) {
          if (!to.get(i)) to.set(i, new DataObject(), true);
          merge(to.get(i), el);
        }
      } else {
        to.set(i, el, true);
      }
    }
  }

  var mergeWithObject = {
    value: function (objectToMerge, moduleId, noBubble) {
      if (
        typeof objectToMerge !== 'object' ||
        Array.isArray(objectToMerge) ||
        objectToMerge == null
      )
        return;
      merge(this, objectToMerge);
      this.triggerChange(noBubble, [moduleId]);
    }
  };

  var mergeWithArray = {
    value: function (objectToMerge, moduleId, noBubble) {
      // TODO find a way to implement this
      this.triggerChange(noBubble, [moduleId]);
      return Debug.warn('mergeWith method not yet implemented for DataArray');
    }
  };

  var setValue = {
    value: function (newValue, noTrigger) {
      if (this.hasOwnProperty('type') && this.hasOwnProperty('value')) {
        if (
          this.value instanceof DataString ||
          this.value instanceof DataNumber ||
          this.value instanceof DataBoolean
        ) {
          this.value.setValue(newValue, true);
        } else {
          this.value = newValue;
        }
        if (!noTrigger) {
          this.triggerChange(false, []);
        }
      } else {
        Debug.warn('Cannot set value of untyped DataObject');
      }
    }
  };

  var commonProperties = {
    set: dataSetter,
    get: dataGetter,
    setChild: setChild,
    setChildSync: setChildSync,
    getChild: getChild,
    getChildSync: getChildSync,
    trace: trace,
    duplicate: duplicator,
    traceSync: traceSync,
    onChange: bindChange,
    unbindChange: unbindChange,
    triggerChange: triggerChange,
    _triggerBubble: triggerBubble,
    linkToParent: linkToParent,
    getType: getType,
    setValue: setValue
  };

  Object.defineProperties(DataObjectProto, commonProperties);
  Object.defineProperties(DataArrayProto, commonProperties);

  Object.defineProperty(DataObjectProto, 'fetch', fetch);
  Object.defineProperty(DataObjectProto, 'resurrect', resurrectObject);
  Object.defineProperty(DataObjectProto, 'mergeWith', mergeWithObject);

  Object.defineProperty(DataArrayProto, 'resurrect', resurrectArray);
  Object.defineProperty(DataArrayProto, 'mergeWith', mergeWithArray);

  const getNative = {
    value: function getNative() {
      return this.s_;
    }
  };

  const getChildNative = {
    value: function getChildNative(jpath) {
      return Promise.resolve(this.getChildSync(jpath));
    }
  };

  const getChildSyncNative = {
    value: function getChildSyncNative(jpath) {
      if (!jpath || jpath.length === 0) {
        return this;
      } else {
        return undefined;
      }
    }
  };

  const setValueNative = {
    value: function setValueNative(value, noTrigger) {
      this.s_ = this.nativeConstructor(value);
      if (!noTrigger) {
        this.triggerChange(false, []);
      }
    }
  };

  const toStringNative = {
    value: function toStringNative() {
      return String(this.s_);
    }
  };

  const traceNative = {
    value: function traceNative(jpath) {
      return Promise.resolve(this.getChildSync(jpath));
    }
  };

  const commonNativeProperties = {
    trace: traceNative,
    onChange: bindChange,
    unbindChange: unbindChange,
    triggerChange: triggerChange,
    linkToParent: linkToParent,
    toJSON: getNative, // The toJSON method is automatically called when JSON.stringify is used
    get: getNative,
    resurrect: getNative,
    getChild: getChildNative,
    getChildSync: getChildSyncNative,
    valueOf: getNative,
    setValue: setValueNative,
    toString: toStringNative
  };

  Object.defineProperties(DataString.prototype, commonNativeProperties);
  Object.defineProperties(DataNumber.prototype, commonNativeProperties);
  Object.defineProperties(DataBoolean.prototype, commonNativeProperties);

  function isDataObject(object) {
    return (
      object instanceof DataObject &&
      Object.getPrototypeOf(object) === DataObjectProto
    );
  }
  DataObject.isDataObject = isDataObject;

  function isDataArray(object) {
    return (
      object instanceof DataArray &&
      Object.getPrototypeOf(object) === DataArrayProto
    );
  }
  DataArray.isDataArray = isDataArray;

  function isSpecialObject(object) {
    return (
      isDataObject(object) ||
      isDataArray(object) ||
      isSpecialNativeObject(object)
    );
  }

  function isSpecialNativeObject(object) {
    return (
      object instanceof DataString ||
      object instanceof DataNumber ||
      object instanceof DataBoolean
    );
  }

  function isTypedObject(object) {
    return (
      object.hasOwnProperty('type') &&
      (object.hasOwnProperty('value') || object.hasOwnProperty('url'))
    );
  }

  function transformNative(object) {
    var type;

    if (isSpecialNativeObject(object)) {
      type = object.getType();
      object = object.get();
    } else {
      type = typeof object;
    }

    switch (type) {
      case 'string':
        return new DataString(object);

      case 'number':
        return new DataNumber(object);

      case 'boolean':
        return new DataBoolean(object);
    }
  }

  return {
    DataObject: DataObject,
    DataArray: DataArray,
    DataString: DataString,
    DataBoolean: DataBoolean,
    DataNumber: DataNumber,
    isSpecialObject: isSpecialObject,
    isSpecialNativeObject: isSpecialNativeObject,
    resurrect: DataObject.resurrect,
    check: DataObject.check
  };
});
