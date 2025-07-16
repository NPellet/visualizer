'use strict';

define(function () {
  const crons = {};

  var create = function (url, interval, callback, overwrite, cancelStart) {
    var name = url;

    if (crons[name] && overwrite) {
        remove(name);
      }

    crons[name] = [url, interval, false, false, callback];

    if (!cancelStart) {
      start(name);
    }

    return name;
  };

  var start = function (name) {
    (function (cronName) {
      crons[cronName][3] = window.setTimeout(function () {
        $.ajax({
          url: crons[cronName][0],
          timeout: 1200,
          method: 'get',
          success(response) {
            crons[cronName][4](response);
            start(cronName);
          },
        });
      }, crons[cronName][1]);
    })(name);
  };

  var stop = function (name) {
    if (!crons[name]) {
      return;
    }

    window.clearTimeout(crons[name][3]);
  };

  var remove = function (name) {
    if (!crons[name]) {
      return;
    }

    stop(name);
    delete crons[name];
  };

  return {
    start,
    remove,
    erase: remove,
    stop,
    pause: stop,
    create,
    make: create,
  };
});
