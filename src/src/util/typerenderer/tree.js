'use strict';

define(['../util'], function(Util) {
  let d3;

  async function initInOut() {
    d3 = await Util.require('d3');
  }

  async function renderInOut(el, value, rootVal, _options) {
    el.empty();

    return el;
  }

  return {
    init: initInOut,
    toscreen: renderInOut,
  };
});
