'use strict';

define(function () {
  var cache = {};
  var exports = {};

  exports.get = function (name) {
    return cache[name];
  };

  exports.set = function (name, value) {
    return (cache[name] = value);
  };

  exports.clear = function () {
    cache = {};
  };

  return exports;
});
