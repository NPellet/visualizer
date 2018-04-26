'use strict';

define([
    'jquery',
    'modules/default/defaultview',
    'src/util/util',
    'quill',
    'lodash',
    'src/main/grid',
    'katex'
], function ($, Default, Util, Quill, _, Grid, katex) {
    window.katex = katex; // Needed for quill to work :(
    function View() {
        this._id = Util.getNextUniqueId();
    }

    $.extend(true, View.prototype, Default, {
        init: function () {
            var that = this;
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
        initEditor: function () {
            Util.loadCss('./components/quill/quill.core.css').then(() => {
                return Util.loadCss('./components/quill/quill.snow.css');
            }).then(() => {
                return Util.loadCss('node_modules/katex/dist/katex.min.css');
            }).then(() => {
                var contents = this.module.definition.richtext || '';
                this.dom = $(
                    `<div class="quill_wrapper">
                        <div id="${this._id}" class="quill_editor" />
                     </div>`
                );

                this.module.getDomContent().html(this.dom);
    
                const readOnly = !this.module.getConfigurationCheckbox('editable', 'isEditable');
                this.instance = new Quill('#' + this._id, {
                    modules: {
                        formula: true,
                        toolbar: readOnly ? false : [
                            [{header: [1, 2, false]}],
                            ['size', 'font', 'color', 'background'],
                            ['bold', 'italic', 'underline', 'strike'],
                            ['link', 'image', 'code-block'],
                            ['align', 'indent', 'list'],
                            ['formula']
                        ]
                    },
                    placeholder: 'Start composing here...',
                    readOnly,
                    theme: 'snow' // or 'bubble'
                });
    
                if (this.storeInView) {
                    this.instance.setContents(contents);
                    // this.module.controller.valueChanged(contents);
                }
                this.instance.on('text-change', () => {
                    this.valueChanged(this.instance.getContents());
                });
                this.resolveReady();
            });
        },
        onActionReceive: {
            insertHtml: function (html) {
                this.instance.focus();
                html = String(html);
                const range = this.instance.getSelection();
                this.instance.deleteText(range.index, range.length);
                this.instance.clipboard.dangerouslyPasteHTML(range.index, html);
            },
            insertText: function (text) {
                this.instance.focus();
                text = String(text);
                const range = this.instance.getSelection();
                this.instance.deleteText(range.index, range.length);
                this.instance.clipboard.insertText(range.index, text);
            }
        }
    });

    return View;
});
