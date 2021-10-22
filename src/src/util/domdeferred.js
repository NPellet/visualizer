'use strict';

define(function () {
  let deferred = $.Deferred();
  return {
    notify: function (dom) {
      deferred.notify(dom);
    },
    progress: deferred.progress
  };
});
