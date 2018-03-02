'use strict';

define([
    'jquery',
    'modules/default/defaultview',
    'src/util/util',
    'quill',
    'lodash',
    'src/main/grid'
], function ($, Default, Util, Quill, _, Grid) {
    function View() {
        this._id = Util.getNextUniqueId();
    }

    $.extend(true, View.prototype, Default, {
        init: function () {
            var that = this;
            this.plainHtml = this.module.getConfigurationCheckbox(
                'plainHtml',
                'yes'
            );
            this.debounce = this.module.getConfiguration('debouncing');
            this.storeInView = this.module.getConfigurationCheckbox(
                'storeInView',
                'yes'
            );
            this.valueChanged = _.debounce(function () {
                that.module.controller.valueChanged.apply(
                    that.module.controller,
                    arguments
                );
            }, this.debounce);
        },
        inDom: function () {
            this.initEditor();
        },
        blank: {
            html: function () {
                this.replaceContent('');
            }
        },
        update: {
            html: function (moduleValue) {
                this.module.data = moduleValue;
                var val = moduleValue.get();
                if (this.storeInView) {
                    this.module.definition.richtext = val;
                }
                this.replaceContent(val);
            }
        },
        initEditor: function () {
            var initText = this.module.definition.richtext || '';
            this.readOnly = !this.module.getConfigurationCheckbox(
                'editable',
                'isEditable'
            );

            if (this.plainHtml) {
                this.dom = $('<div>');
                if (this.storeInView) this.dom.html(initText);
                this.module.getDomContent().html(this.dom);
                this._setCss();
            } else {
                this.dom = $(
                    '<div id="' + this._id + '" contenteditable="true">'
                );
                if (this.storeInView) {
                    this.dom.html(initText);
                    this.module.controller.valueChanged(initText);
                }
                var toolbar = $('<div id="' + this._id + '_toolbar">');
                this.module.getDomContent().html([toolbar, this.dom]);
                this._setCss();

                this.instance = new Quill('#' + this._id, {
                    modules: {toolbar: {container: toolbar}},
                    readOnly: this.readOnly
                });

                this.instance.on('change', () => {
                    this.valueChanged(this.instance.getData());
                    if (
                        this.module.getConfigurationCheckbox(
                            'autoHeight',
                            'yes'
                        )
                    ) {
                        this.module
                            .getDomWrapper()
                            .height(this.getContentHeight() + 50);
                        Grid.moduleResize(this.module);
                    }
                });
            }
            this.resolveReady();
        },
        replaceContent: function (html) {
            html = String(html);
            if (this.plainHtml) {
                this.dom.html(html);
            } else {
                this.instance.clipboard.dangerouslyPasteHTML(html);
            }
        },
        getContentHeight: function () {
            var height = 0;
            this.dom.children().each(function () {
                height += $(this).height();
            });
            return height;
        },

        onActionReceive: {
            insertHtml: function (html) {
                html = String(html);
                if (this.plainHtml) {
                    this.dom.html(html);
                } else {
                    var len = this.instance.getLength();
                    this.instance.clipboard.dangerouslyPasteHTML(len, html);
                }
            },
            insertText: function (text) {
                text = String(text);
                if (this.plainHtml) {
                    this.dom.html(text);
                } else {
                    var len = this.instance.getLength();
                    this.instance.clipboard.insertText(len, text);
                }
            }
        },

        _setCss: function () {
            this.dom.css({
                height: '100%',
                width: '100%',
                padding: '5px',
                boxSizing: 'border-box'
            });

            this.dom.css({
                background: ''
            });
            this.dom.css({
                'background-color': 'white'
            });
            this.dom.removeClass('richtext-postit');
            this.dom
                .parents('.ci-module-wrapper')
                .removeClass('ci-module-richtext-postit');
        }
    });

    return View;
});
