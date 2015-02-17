'use strict';

define(['components/twig.js/twig.min', 'src/util/typerenderer', 'src/util/util'], function (Twig, Renderer, Util) {

    // Add support for deferred rendering

    Twig.extend(function (Twig) {
        Twig.Template.prototype.renderAsync = function () {

            var promises = this.promises = [];

            return {
                render: function () {
                    Promise.all(promises).then(function (results) {
                        var res;
                        for (var i = 0, ii = results.length; i < ii; i++) {
                            res = results[i];
                            $('#' + res.id).html(res.html);
                            if (res.def.build)
                                res.def.build();
                        }
                    });
                },
                html: this.render.apply(this, arguments)
            };
        };
    });

    // Add typerenderer support

    Twig.extendFunction('rendertype', function (value, options, forceType) {

        if (!value)
            return;

        if (typeof options === 'string') {
            forceType = options;
            options = {};
        }

        if (forceType) {
            value = new DataObject({
                type: forceType,
                value: value
            });
        }

        var id = Util.getNextUniqueId();

        this.promises.push(new Promise(function (resolve) {
            var def = Renderer.toScreen(value, {}, options);
            def.always(function (render) {
                resolve({
                    html: render,
                    def: def,
                    id: id
                });
            });
        }));

        return '<span id="' + id + '"></span>';

    });

    Twig.extendFunction('toJSON', function (value, spaces) {
        spaces = spaces || 2;
        return '<pre><code>' + JSON.stringify(value, null, spaces) + '</code></pre>';
    });

    Twig.extendFunction('log', function () {
        console.log.apply(console, arguments);
    });

    return Twig;

});
