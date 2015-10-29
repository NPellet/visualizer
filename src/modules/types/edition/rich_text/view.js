'use strict';

define([
    'modules/default/defaultview',
    'src/util/util',
    'ckeditor',
    'lodash',
    'src/main/grid',
    'chroma'
], function (Default, Util, CKEDITOR, _, Grid, chroma) {

    function View() {
        this._id = Util.getNextUniqueId();
    }

    $.extend(true, View.prototype, Default, {
        init: function () {
            this.plainHtml = this.module.getConfigurationCheckbox('plainHtml', 'yes');
        },
        inDom: function () {
            this.initEditor();
            this.resolveReady();
        },
        blank: {
            html: function () {
                this.updateEditor('');
            }
        },
        update: {
            html: function (moduleValue) {
                this.module.data = moduleValue;
                var val = moduleValue.get();
                this.module.definition.richtext = val;
                this.updateEditor(val);
            }
        },
        initEditor: function () {
            var that = this;
            var initText = this.module.definition.richtext || '';
            this.readOnly = !this.module.getConfigurationCheckbox('editable', 'isEditable');
            if (this.readOnly && this.plainHtml) {
                this.dom = $('<div>');
                this.dom.html(initText);
                this.module.getDomContent().html(this.dom);
                this._setCss();
            } else {
                this.dom = $('<div id="' + this._id + '" contenteditable="true">');
                this.dom.html(initText);
                this.module.getDomContent().html(this.dom);
                this._setCss();
                this.module.controller.valueChanged(initText);
                if (CKEDITOR.instances[this._id]) {
                    CKEDITOR.instances[this._id].destroy();
                }
                CKEDITOR.disableAutoInline = true;
                var options = {
                    extraPlugins: 'mathjax,font,sourcedialog,codesnippet',
                    removeButtons: '',
                    language: 'en'
                };
                if (this.readOnly) {
                    options.readOnly = true;
                    options.removePlugins = 'toolbar';
                    options.allowedContent = true;
                }
                this.instance = CKEDITOR.inline(this._id, options);
                this.instance.on('change', function () {
                    that.module.controller.valueChanged(that.instance.getData());
                    if (that.module.getConfigurationCheckbox('autoHeight', 'yes')) {
                        that.module.getDomWrapper().height(that.getContentHeight() + 50);
                        Grid.moduleResize(that.module);
                    }

                });
            }
        },
        updateEditor: function (html) {
            if (this.plainHtml) {
                this.dom.html(html);
            } else {
                this.instance.setData(html);
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
                this.instance.insertHtml(html, 'unfiltered_html');
            },
            insertText: function (text) {
                this.instance.insertText(text);
            }
        },

        _setCss: function () {
            var bgColor = this.module.getConfiguration('bgColor');
            this.dom.css({
                height: '100%',
                width: '100%',
                padding: '5px',
                boxSizing: 'border-box'
            });
            if (this.module.getConfigurationCheckbox('postit', 'yes')) {
                var ch = chroma(bgColor[0], bgColor[1], bgColor[2]);
                this.dom.addClass('richtext-postit');
                this.dom.parents('.ci-module-wrapper').addClass('ci-module-richtext-postit');
                this.dom.css({
                    background: Util.getCssVendorPrefix() + 'radial-gradient(center, ellipse cover, ' + ch.brighter().hex() + ' 0%, ' + ch.hex() + ' 100%)'
                    //background: 'radial-gradient(ellipse at center, ' + ch.brighter().hex() + ' 0%,' + ch.hex() + ' 100%)',
                });
            } else {
                this.dom.css({
                    background: ''
                });
                this.dom.css({
                    'background-color': 'rgba(' + bgColor.join(',') + ')'
                });
                this.dom.removeClass('richtext-postit');
                this.dom.parents('.ci-module-wrapper').removeClass('ci-module-richtext-postit');
            }
        }
    });

    return View;

});
