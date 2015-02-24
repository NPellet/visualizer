'use strict';

define(['lodash', 'src/util/util', 'marked', 'highlightjs', 'components/markdown-js/lib/markdown'], function (_, Util, marked, highlights) {
    var cssPromises = [];
    cssPromises.push(Util.loadCss('./components/highlight.js/src/styles/github.css'));
    var cssLoaded = Promise.all(cssPromises);


    return {
        filter: function gcFilter(md, resolve) {
            // init. We check ourselves what languages where registered
            // since highlight.js systematically re-registers already
            // registered languages
            cssLoaded.then(function() {
                resolve({
                    type: 'html',
                    //value: markdown.toHTML(md.resurrect())
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