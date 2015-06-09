'use strict';

define(['modules/default/defaultview', 'src/util/datatraversing', 'src/util/api'], function (Default, DataTraversing, API) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {

        init: function () {
            this.dom = $('<div />');
            this.module.getDomContent().html(this.dom);
            this.callback = null;
        },

        inDom: function () {

            var that = this,
                structure = this.module.getConfiguration('structure'),
                tpl_file = this.module.getConfiguration('tpl_file'),
                tpl_html = this.module.getConfiguration('tpl_html'),
                form;

            var json, def;

            try {
                json = JSON.parse(structure);
            } catch (e) {
                return;
            }

            if (tpl_file) {
                def = $.get(tpl_file, {});
            } else {
                def = tpl_html;
            }

            require(['./forms/form'], function (Form) {

                $.when(def).done(function (tpl) {

                    form = new Form({});
                    form.init({
                        onValueChanged: function (value, fieldElement) {
                            var jpath = fieldElement.field.options.jpath;
                        }
                    });

                    form.setStructure(json);
                    form.onStructureLoaded().done(function () {
                        form.fill({}); // For now let's keep it empty.
                    });

                    form.onLoaded().done(function () {
                        form.setTpl(tpl);
                        that.dom.html(form.makeDomTpl());
                        form.inDom();
                        that.resolveReady();
                    });
                });
            });
            this.form = form;
        }

    });

    return View;

});
