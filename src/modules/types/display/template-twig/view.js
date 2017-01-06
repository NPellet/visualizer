'use strict';

define([
    'jquery',
    'modules/default/defaultview',
    'lib/twigjs/twig',
    'src/util/debug',
    'lodash',
    'src/util/Form',
    'src/util/util'
], function ($, Default, Twig, Debug, _, Form, Util) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init() {
            var configTemplate = this.module.getConfiguration('template');
            this.hasTemplate = new Promise((resolve) => {
                this._resolveTemplate = resolve;
            });
            if (configTemplate) {
                this._resolveTemplate();
            }
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


            if (this.form) this.form.unbind();
            this.form = new Form(this.dom);
            this.form.onChange(submit);
            this.form.onSubmit(() => {
                submit('submit');
            });

            this._values = new DataObject();

            if (!this.renderPromise) {
                this.renderPromise = Promise.resolve();
            }

            this.renderPromise.then(() => {
                this.template = Twig.twig({
                    data: this.module.getConfiguration('template')
                });
            });
        },
        inDom() {
            this.module.getDomContent().html(this.dom);
            this.resolveReady();
            this.render(() => {
                this.resetForm();
                if (this.module.getConfiguration('template')) {
                    this.submit();
                }
            });
        },

        rerender() {
            this.render(() => {
                this.resetForm();
            });
        },

        resetForm() {
            this.form.setData(this.currentForm);
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
            return this.currentForm = this.form.getData(false);
        },

        submit(type) {
            var out = this.getForm();
            if (type === 'submit') {
                this.module.controller.onFormSubmitted(out);
            } else {
                this.module.controller.onFormChanged(out);
            }
        },
        blank: {
            value() {
                this.renderPromise = this.renderPromise.then(() => {
                    this.dom.hide();
                    this.getForm();
                }).catch(e => {
                    Debug.warn('Error');
                });
                return null;
            },
            tpl() {
                this.renderPromise = this.renderPromise.then(() => {
                    this.dom.hide();
                    this.getForm();
                    this.template = Twig.twig({
                        data: ''
                    });
                });
                return null;
            },
            form: Util.noop,
            style: Util.noop
        },
        update: {
            value(value, name) {
                /*
                 Convert special DataObjects
                 (twig does some check depending on the filter used
                 and the values need to be native)
                 */
                this._values[name] = DataObject.resurrect(value.get());
                this.rerender();
            },
            tpl(value) {
                var tpl = value.get().toString();
                return this.renderPromise.then(() => {
                    this.template = Twig.twig({
                        data: tpl
                    });
                    this.rerender();
                    return null;
                }).then(() => this._resolveTemplate()).catch(e => {
                    Debug.info('Problem with template: ' + e);
                }).then(() => {
                    this.submit();
                });
            },

            form(value) {
                this.formObject = value;
                // fill form should execute when the template exists
                // It doesn't make sense otherwise
                return this.hasTemplate.then(() => this.fillForm());
            },

            style(value) {
                this.styleObject = value.resurrect();
                this.rerender();
            }
        },

        fillForm() {
            this.form.setData(this.formObject);
            this.submit();
        },

        render(cb) {
            var that = this;
            return this.renderPromise = this.renderPromise.then(() => {
                var render = this.template.renderAsync(this._values);
                this.dom.html(render.html);
                const renderProm = render.render().then(function () {
                    if (cb) cb();
                    that.setStyle();
                    that.module.controller.onRendered(that.dom.html());
                }).catch(e => {
                    Debug.warn('Error rendering twig template', e);
                });

                this.dom.show();
                return renderProm;
            });
        }
    });

    return View;

});
