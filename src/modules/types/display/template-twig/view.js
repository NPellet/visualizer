'use strict';

define(['modules/default/defaultview', 'lib/twigjs/twig'], function (Default, Twig) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {

            this.dom = $('<div>').css({
                height: '100%',
                width: '100%'
            });

            this._values = new DataObject();
            this.template = Twig.twig({
                data: this.module.getConfiguration('template')
            });
        },
        blank: {
            value: function (varName) {
                this.dom.empty();
            },
            tpl: function () {
            }
        },
        inDom: function () {
            this.module.getDomContent().html(this.dom);
            this.resolveReady();
            this.render();
        },
        update: {
            value: function (value, name) {
                // Extract typed value
                value = value.get();

                // Convert special objects like DataString (twig does some check depending on the filter used and the values need to be native)
                if (typeof value.resurrect === 'function') {
                    value = value.resurrect();
                }

                this._values[name] = value;

                this.render();
            },
            tpl: function (value) {
                var tpl = value.get().toString();
                try {
                    this.template = Twig.twig({
                        data: tpl
                    });
                    this.module.definition.configuration.groups.group[0].template[0] = tpl;
                    this.render();
                } catch (e) {
                }
            }
        },
        render: function () {
            var render = this.template.renderAsync(this._values);
            this.dom.html(render.html);
            render.render();
        }
    });

    return View;

});
