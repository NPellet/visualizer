'use strict';

define(['../util'], function(Util) {
  let d3;

  async function initInOut() {
    d3 = await Util.require('d3');
  }

  async function renderInOut(el, value, rootVal, _options) {
    el.empty();
    console.log(el);
    createTree('ASDF', JSON.parse(JSON.stringify(value)), _options);
    return el;
  }

  return {
    init: initInOut,
    toscreen: renderInOut,
  };

  function createTree(selectorId, data, options = {}) {
    console.log(data);
    const result = d3.phylogram.build(selectorId, data, {
      height: options.height || 600,
      width: options.width || 800,
      skipBranchLengthScaling: true,
      skipTicks: false,
      skipLabels: options.skipLabels === undefined ? false : options.skipLabels,
      skipNodeLabels:
        options.skipLabels === undefined ? false : options.skipNodeLabels,
      labelDx: options.labelDx || 0,
      labelDy: options.labelDy || 0,
      labelSize: options.labelSize || 12,
      nodeLabelSize: options.nodeLabelSize || 12,
      children: function(node) {
        return node.children;
      },
    });
    console.log({ result });
    debugger;
    /**
    d3.selectAll(`${selectorId} .link`).each(function() {
      d3.select(this).attr('stroke-width', '5px');
    });
    */
  }
});
