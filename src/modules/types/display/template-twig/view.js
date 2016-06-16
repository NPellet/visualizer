'use strict';

define([
    'jquery',
    'modules/default/defaultview',
    'lib/twigjs/twig',
    'src/util/debug',
    'lodash'
], function ($, Default, Twig, Debug, _) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init: function () {
            this.getForm();
            this.dom = $('<div>').css({
                height: '100%',
                width: '100%',
                'user-select': this.module.getConfigurationCheckbox('selectable', 'yes') ? 'initial' : 'none'
            });

            var debouncing = this.module.getConfiguration('debouncing');
            if (debouncing) {
                var submit = _.debounce(this.submit, debouncing).bind(this);
            } else {
                submit = this.submit.bind(this);
            }


            this.dom.on('input', 'input,textarea', submit);
            this.dom.on('submit', 'form', function (e) {
                submit('submit');
                e.preventDefault();
            });
            this.dom.on('change', 'input,select', submit);

            this._values = new DataObject();
            this.template = Twig.twig({
                data: this.module.getConfiguration('template')
            });
        },
        blank: {
            value: function () {
                this.getForm();
                this.dom.empty();
            },
            tpl: function () {
                this.getForm();
                this.template = Twig.twig({
                    data: ''
                });
            },
            form: function () {

            },

            style: function () {
                this.getForm();
            }
        },
        inDom: function () {
            this.module.getDomContent().html(this.dom);
            this.resolveReady();
            this.render(() => {
                this.resetForm();
            });
        },

        rerender() {
            this.render(() => {
                this.resetForm();
            });
        },

        setElement(el, value) {
            switch (el.type) {
                case 'checkbox':
                    // $(el).attr('checked', value);
                    el.checked = value;
                    break;

                case 'radio':
                    var name = el.name;
                    this.dom.find(`input[name="${name}"]`).each(function () {
                        this.checked = false;
                    });
                    this.dom.find(`input[value="${value}"]`).each(function () {
                        this.checked = true;
                    });
                    break;
                default:
                    // $(el).attr('value', value);
                    el.value = value;
                    break;
            }
        },

        resetForm() {
            var form = this.currentForm;
            if (!form || !this.dom) return;
            for (let i = 0; i < form.length; i++) {
                var $el = this.dom.find(`input[name="${form[i].name}"]`);
                var el = $el[0];
                if (!el) continue;
                this.setElement(el, form[i].value);
            }
        },

        setForm(data) {
            if (!data) data = this.currentForm;
            if (!data) return;


        },

        setStyle() {
            var style = this.styleObject;
            if (!style) return;
            if (!(style instanceof Array)) {
                style = [style];
            }

            for (let i = 0; i < style.length; i++) {
                if (style[i].input) {
                    var selector = `input[name="${style[i].input}"],textarea[name="${style[i].input}"],select[name="${style[i].input}"]`;
                } else {
                    selector = style[i].selector;
                }
                var $el = this.dom.find(selector);
                if (style[i].attributes) {
                    $el.attr(style[i].attributes);
                }
                if (style[i].style) {
                    $el.css(style[i].style);
                }
            }
        },

        getForm() {
            if (!this.dom) return;
            var inputs = this.dom.find('input,textarea,select');
            var out = inputs.map(function () {
                const {name, value, type} = this;
                return {name, value, type, dom: this};
            }).toArray().filter(o => {
                if (!o.name) return false;
                return (o.type !== 'radio' || o.dom.checked);
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

            this.currentForm = out;
            return out;
        },

        submit: function (type) {
            var out = this.getForm();

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
                this.rerender();
            },
            tpl: function (value) {
                var tpl = value.get().toString();
                try {
                    this.template = Twig.twig({
                        data: tpl
                    });
                    this.rerender();
                } catch (e) {
                    Debug.info('Problem with template: ' + e);
                }
            },

            form: function (value) {
                this.formObject = value;
                this.fillForm();
            },

            style: function (value) {
                this.styleObject = value.resurrect();
                this.rerender();
            }
        },

        fillForm: function () {
            // Search for leaf properties
            var form = this.getForm();
            for (let i = 0; i < form.length; i++) {
                var fillWith = this.formObject.getChildSync(form[i].name.split('.'));
                fillWith = fillWith || null;
                this.setElement(form[i].dom, fillWith);
            }
            this.submit();
        },

        render: function (cb) {
            var that = this;
            var render = this.template.renderAsync(this._values);
            this.dom.html(render.html);
            return render.render().then(function () {
                if (cb) cb();
                that.setStyle();
                that.module.controller.onRendered(that.dom.html());
            });
        }
    });

    return View;

});
