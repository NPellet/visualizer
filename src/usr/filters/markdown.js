'use strict';

define(['src/util/util', 'marked', 'highlightjs'], function (Util, marked, highlights) {
  let cssPromises = [];
  cssPromises.push(Util.loadCss('lib/highlight.js/styles/default.css'));
  let cssLoaded = Promise.all(cssPromises);

  return {
    filter: function gcFilter(md, resolve) {
      cssLoaded.then(function () {
        resolve({
          type: 'html',
          value: marked(md.resurrect(), {
            highlight: function (code) {
              return highlights.highlightAuto(code).value;
            }
          })
        });
      });
    }
  };
});
