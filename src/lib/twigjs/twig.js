'use strict';

define([
    'components/twig.js/twig.min',
    'src/util/typerenderer',
    'src/util/util'
], function (Twig, Renderer, Util) {

    // Add support for deferred rendering

    Twig.extend(function (Twig) {
        Twig.Template.prototype.renderAsync = function () {

            var waiting = this.waiting = [];

            return {
                render: function () {
                    var prom = [];
                    for (var i = 0; i < waiting.length; i++) {
                        var data = waiting[i];
                        prom.push(Renderer.render($('#' + data[0]), data[1], data[2]));
                    }
                    return Promise.all(prom);
                },
                html: this.render.apply(this, arguments)
            };
        };
    });

    // Add typerenderer support

    Twig.extendFunction('rendertype', function (value, options, forceType) {

        if (!value) {
            return;
        }

        if (typeof options === 'string') {
            forceType = options;
            options = {};
        }

        if (forceType) {
            value = new DataObject({
                type: forceType,
                value: DataObject.check(value, true).get()
            });
        }

        var id = Util.getNextUniqueId();

        this.waiting.push([id, value, options]);

        return '<span style="display:inline-block; width:100%" id="' +
            id + '"></span>';

    });

    Twig.extendFunction('toJSON', function (value, spaces) {
        spaces = spaces || 2;
        return '<pre><code>' + JSON.stringify(value, null, spaces) +
            '</code></pre>';
    });

    Twig.extendFunction('log', function () {
        console.log.apply(console, arguments);
    });

    return Twig;

});
