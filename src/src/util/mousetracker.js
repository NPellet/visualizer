'use strict';

define(['jquery', 'lodash'], function ($, _) {
  let state = {
    kind: 'grid'
  };

  document.addEventListener('mousemove', _.throttle((e) => {
    let id = e.target.id;
    if (id === 'modules-grid') {
      state = {
        kind: 'grid'
      };
      return;
    }
    let $target = $(e.target);
    if ($target.hasClass('ci-module-header') || $target.parents('.ci-module-header').length) {
      let moduleId = $target.parents('.ci-module-wrapper').attr('data-module-id');
      state = {
        kind: 'module',
        moduleId: Number(moduleId)
      };
      return;
    }

    state = {};
  }, 200));

  return {
    getState: function () {
      return state;
    }
  };
});
