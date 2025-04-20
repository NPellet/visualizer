'use strict';

define(function () {
  var deferred = $.Deferred();
  return {
    notify(dom) {
      deferred.notify(dom);
    },
    progress: deferred.progress,
  };
});
