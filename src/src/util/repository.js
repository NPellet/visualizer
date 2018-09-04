'use strict';

define(['jquery', 'src/util/event'], function ($, Event) {
  var callbackId = -1;

  var bindKeysRecursively = function (repository, keys, callbackId, add) {
    for (var i = 0, l = keys.length; i < l; i++) {
      if (Array.isArray(keys[i])) {
        bindKeysRecursively(repository, keys[i], callbackId, add);
        continue;
      }
      repository._keys[keys[i]] = repository._keys[keys[i]] || [];

      if (add) {
        repository._keys[keys[i]].push(callbackId);
      } else {
        var index = repository._keys[keys[i]].indexOf(callbackId);

        if (index == -1) {
          continue;
        }
        repository._keys[keys[i]].splice(index, 1);
      }
    }
  };

  var getCommonKeys = function (set1, set2) {
    var set3 = set2.slice(0),
      set1Rev = {};
    for (var i = 0, l = set1.length; i < l; i++) {
      set1Rev[set1[i]] = true;
    }
    return compareKeysRecursively(set1Rev, set3, true);
  };


  var compareKeysRecursively = function (set1, set2, or) {
    var i, l, set2el,
      set3 = [];
    for (i = 0, l = set2.length; i < l; i++) {
      set2el = set2[i];
      if (Array.isArray(set2el))
        set2el = compareKeysRecursively(set1, set2el, !or);
      if (!set1[set2el] && !or)
        return null;
      else if (set1[set2el])
        set3.push(set2el);
    }
    return set3;
  };


  function Repository(options) {
    this._killers = {};
    this._value = [];
    this.options = options || { doNotSave: false };

    this.on('change', function (sourcekeys, value, senderId) {
      var callbacks = {};
      this._keys = this._keys || [];
      sourcekeys = Array.isArray(sourcekeys) ? sourcekeys : [sourcekeys];

      for (var i = 0; i < sourcekeys.length; i++) {
        if (this._keys[sourcekeys[i]] == undefined)
          continue;
        for (var j = 0; j < this._keys[sourcekeys[i]].length; j++)
          callbacks[this._keys[sourcekeys[i]][j]] = true;
      }


      loop1: for (i in callbacks) {
        var currentCallback = this._callbacks[i];

        if (!currentCallback)
          continue;
        var commonKeys = getCommonKeys(currentCallback[0], sourcekeys);

        if (commonKeys.length > 0 || ((!commonKeys || commonKeys.length == 0) && currentCallback[2])) {
          for (var killerID in this._killers) {
            if (this._killers[killerID].indexOf(+i) > -1) {
              currentCallback[1](value, commonKeys, killerID, senderId);
              continue loop1;
            }
          }
          currentCallback[1](value, commonKeys, null);
        }
      }
    });
  }

  $.extend(Repository.prototype, Event.prototype);

  Repository.prototype.get = function (key) {
    if (this.options.doNotSave === true)
      return;
    return this._value[key];
  };

  Repository.prototype.set = function (keys, value, noTrigger, senderId) {
    if (!Array.isArray(keys))
      keys = [keys];
    else if (!keys.length)
      keys = [];

    this._value = this._value || [];

    if (!(this.options.doNotSave === true))
      this._value[keys] = [keys, value];

    if (!noTrigger) {
      this.trigger('change', keys, value, senderId);
    }
  };


  Repository.prototype.listen = function (keys, callback, sendCallbackOnEmptyArray, killerID) {
    this._keys = this._keys || {};
    this._callbacks = this._callbacks || [];

    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    if (!keys || keys.length == undefined || keys.length == 0) {
      return;
    }


    var _callbackId = ++callbackId;
    this._callbacks[_callbackId] = [keys, callback, sendCallbackOnEmptyArray];

    if (killerID) {
      this._killers[killerID] = this._killers[killerID] || [];
      this._killers[killerID].push(_callbackId);
    }
    bindKeysRecursively(this, keys, _callbackId, true);

    return callbackId;
  };

  Repository.prototype.kill = function (killerId) {
    if (!this._killers[killerId]) {
      return;
    }

    var callbackIds = this._killers[killerId];
    for (var i = 0, l = callbackIds.length; i < l; i++) {
      bindKeysRecursively(this, this._callbacks[callbackIds[i]][0], callbackIds[i], false);
      delete this._callbacks[callbackIds[i]];
    }

    this._killers[killerId] = [];
  };

  Repository.prototype.resetVariables = function () {
    this._keys = {};
    this._value = [];
  };

  Repository.prototype.resetCallbacks = function () {
    this._killers = {};
    this._callbacks = [];
  };

  Repository.prototype.unListen = function (keys, callbackId) {
    this._keys = this._keys || {};
    this._callbacks = this._callbacks || [];
    this._callbacks[callbackId] = undefined;
    bindKeysRecursively(this, keys, callbackId, false);
  };

  Repository.prototype.resendAll = function () {
    if (this.options.doNotSave === true)
      return;
    for (var i in this._value)
      this.set(this._value[i][0], this._value[i][1]);
  };

  Repository.prototype.getKeys = function () {
    var value = this._value,
      keys = [];
    for (var i in value) {
      keys.push(i);
    }
    return keys;
  };

  return Repository;
});
