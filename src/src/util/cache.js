'use strict';

define(function () {
  let cache = {};
  let exports = {};

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
