'use strict';

define([
  'browserified/twig/twig',
  'src/util/typerenderer',
  'src/util/util',
], function(Twig, Renderer, Util) {
  // Add support for deferred rendering
  Twig.extend(function(Twig) {
    Twig.Template.prototype.renderAsync = function() {
      var waiting = (this.waiting = []);
      return {
        render: function() {
          var prom = [];
          for (var i = 0; i < waiting.length; i++) {
            var data = waiting[i];
            prom.push(Renderer.render($('#' + data[0]), data[1], data[2]));
          }
          return Promise.all(prom);
        },
        html: this.render.apply(this, arguments),
      };
    };
  });

  // Add typerenderer support
  function rendertype(type, value, options, forceType) {
    if (!value) return;

    if (typeof options === 'string') {
      forceType = options;
      options = {};
    }

    if (forceType) {
      value = new DataObject({
        type: forceType,
        value: DataObject.check(value, true).get(),
      });
    }

    var id = Util.getNextUniqueId();
    this.template.waiting.push([id, value, options]);

    if (type === 'inline') {
      return `<span id="${id}"></span>`;
    } else {
      return `<div style="width: 100%; height: 100%" id="${id}"></div>`;
    }
  }

  Twig.extendFunction('rendertype', function(value, options, forceType) {
    return rendertype.call(this, 'inline', value, options, forceType);
  });

  Twig.extendFunction('rendertypeBlock', function(value, options, forceType) {
    return rendertype.call(this, 'block', value, options, forceType);
  });

  Twig.extendFunction('toJSON', function(value, spaces) {
    spaces = spaces || 2;
    return `<pre><code>${JSON.stringify(value, null, spaces)}</code></pre>`;
  });

  Twig.extendFunction('log', function() {
    console.log.apply(console, arguments);
  });

  Twig.extendFilter('regReplace', function(val, rest) {
    const [reg, ...params] = rest;
    if (typeof val !== 'string' || !reg) {
      return val;
    }
    return val.replace(new RegExp(reg), ...params);
  });

  // Add filters for mathematical functions
  Object.getOwnPropertyNames(Math).forEach(function(method) {
    if (typeof Math[method] === 'function') {
      Twig.extendFilter('math_' + method, function() {
        return Math[method].apply(null, arguments);
      });
    }
  });

  Object.getOwnPropertyNames(String.prototype).forEach(function(method) {
    if (typeof String.prototype[method] === 'function') {
      Twig.extendFilter('string_' + method, function(val, rest) {
        if (typeof val !== 'string') {
          return val;
        }
        return String.prototype[method].apply(val, rest);
      });
    }
  });

  return Twig;
});
