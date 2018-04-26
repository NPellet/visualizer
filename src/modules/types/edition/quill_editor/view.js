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
            Util.loadCss('./components/quill/quill.core.css').then(() => {
                return Util.loadCss('./components/quill/quill.snow.css');
            }).then(() => {
                var initText = this.module.definition.richtext || '';
                this.readOnly = !this.module.getConfigurationCheckbox(
                    'editable',
                    'isEditable'
                );
    
                this.dom = $(
                    `<div class="quill_wrapper">
                        <div id="${this._id}" class="quill_editor" />
                     </div>`
                );
                // if (this.storeInView) {
                //     this.dom.html(initText);
                //     this.module.controller.valueChanged(initText);
                // }
                this.module.getDomContent().html(this.dom);
                this._setCss();
    
                this.instance = new Quill('#' + this._id, {modules: {
                    toolbar: [
                        [{header: [1, 2, false]}],
                        ['bold', 'italic', 'underline'],
                        ['image', 'code-block']
                    ]
                },
                placeholder: 'Compose an epic...',
                theme: 'snow' // or 'bubble');
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
                this.resolveReady();
            });
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
                const range = this.instance.getSelection();
                this.instance.deleteText(range.index, range.length);
                this.instance.clipboard.dangerouslyPasteHTML(range.index, html);
            },
            insertText: function (text) {
                text = String(text);
                const range = this.instance.getSelection();
                this.instance.deleteText(range.index, range.length);
                this.instance.clipboard.insertText(range.index, text);
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
