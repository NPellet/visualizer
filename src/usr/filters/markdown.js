'use strict';

define(['components/markdown-js/lib/markdown'], function () {

    return {
        filter: function gcFilter(md, resolve) {
            resolve({
                type: 'html',
                value: markdown.toHTML(md.resurrect())
            });
        }
    };
});