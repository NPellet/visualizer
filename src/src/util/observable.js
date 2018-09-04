'use strict';

define(['jquery', 'src/util/event'], function ($, Event) {
  var Observable = function (name, value) {
    this.set(name, value);
  };

  $.extend(Observable.prototype, Event.prototype);

  Observable.get = function (name) {
    return this._value[name];
  };

  var slicer = Array.prototype.slice;
  Observable.update = function (name, value) {
    this._value = this._value || {};
    this._value[name] = value;
    return this;
  };

  Observable.set = function (name, value) {
    var current = this.get(name);
    if (current == value) return;
    this.update(name, value);
    var to = this.get(name);
    this.trigger('change', name, to, current);
    return this;
  };

  Observable.prototype._proxiedSet = function () {
    if (!this.__proxiedSet) this.__proxiedSet = this.set.bind(this);
    return this.__proxiedSet;
  };
  // List of observables targets
  // When any of the target change, change myself
  // Example:
  //
  // var obs1 = new Observable();
  // var obs2 = new Observable();
  // obs1.pull(obs2);
  // obs2.set('varName', 'varVal'); // ==> obs1.set('varName', 'varVal')
  Observable.prototype.pull = function () {
    var mySet = this._proxiedSet();
    $.each(arguments, function (i, trgt) {
      trgt.on('change', mySet);
    });
  };

  Observable.prototype.unpull = function () {
    var mySet = this._proxiedSet();
    $.each(arguments, function (i, trgt) {
      trgt.off('change', mySet);
    });
  };

  Observable.prototype.push = function () {
    var that = this;
    $.each(arguments, function (i, trgt) {
      that.on('change', trgt._proxiedSet);
    });
  };

  Observable.prototype.unpush = function () {
    var that = this;
    $.each(arguments, function (i, trgt) {
      that.off('change', trgt._proxiedSet);
    });
  };

  return Observable;
});
