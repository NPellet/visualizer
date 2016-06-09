'use strict';

define([
    'jquery',
    'modules/default/defaultview',
    'lib/twigjs/twig',
    'src/util/debug'
], function ($, Default, Twig, Debug) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init: function () {

            this.dom = $('<div>').css({
                height: '100%',
                width: '100%',
                'user-select': this.module.getConfigurationCheckbox('selectable', 'yes') ? 'initial' : 'none'
            });

            var submit = this.submit.bind(this);

            this.dom.on('input', 'input,textarea', submit);
            this.dom.on('submit', 'form', function (e) {
                submit('submit');
                e.preventDefault();
            });
            this.dom.on('change', 'input', submit);

            this._values = new DataObject();
            this.template = Twig.twig({
                data: this.module.getConfiguration('template')
            });
        },
        blank: {
            value: function () {
                this.dom.empty();
            },
            tpl: function () {
                this.template = Twig.twig({
                    data: ''
                });
            }
        },
        inDom: function () {
            this.module.getDomContent().html(this.dom);
            this.resolveReady();
            this.render();
        },
        submit: function (type) {
            var inputs = this.dom.find('input,textarea');
            var out = inputs.map(function () {
                const {name, value, type} = this;
                return {name, value, type, dom: this};
            }).toArray().filter(o => {
                if (!o.name) return false;
                if (o.type === 'radio' && !o.dom.checked) return false;
                return true;
            });

            out.forEach(o => {
                switch (o.type) {
                    case 'number':
                    case 'range':
                        o.value = +o.value;
                        break;
                    case 'checkbox':
                        o.value = o.dom.checked;
                        break;
                }
            });

            if (type === 'submit') {
                this.module.controller.onFormSubmitted(out);
            } else {
                this.module.controller.onFormChanged(out);
            }
        },
        update: {
            value: function (value, name) {
                /*
                 Convert special DataObjects
                 (twig does some check depending on the filter used
                 and the values need to be native)
                 */
                this._values[name] = value.resurrect();
                this.render();
            },
            tpl: function (value) {
                var tpl = value.get().toString();
                try {
                    this.template = Twig.twig({
                        data: tpl
                    });
                    this.render();
                } catch (e) {
                    Debug.info('Problem with template: ' + e);
                }
            }
        },
        render: function () {
            var that = this;
            var render = this.template.renderAsync(this._values);
            this.dom.html(render.html);
            render.render().then(function () {
                that.module.controller.onRendered(that.dom.html());
            });
        }
    });

    return View;

});
