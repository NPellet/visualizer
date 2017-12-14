'use strict';

define(['require', 'jquery', 'src/util/util', 'ace/ace'], function (require, $, Util, ace) {


    var FieldConstructor = function () {
    };

    FieldConstructor.prototype.__makeDom = function () {

        this._id = Util.getNextUniqueId();

        var self = this,
            dom = $('<div />'),

            input = $('<div />', {id: this._id, tabindex: 1})
                .css({
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    padding: 20,
                    margin: 0
                })
                .addClass('field-list')
                .appendTo(dom);

        this.fieldElement = input;
        this.input = input;
        dom.addClass('ui-widget-content');
        dom.resizable({
            handles: 's',
            stop: function () {
                self.editor.resize();
            }
        });
        dom.css({
            height: '200px',
            width: '100%'
        });
        this.dom = dom;
        return dom;
    };

    FieldConstructor.prototype.afterShow = function () {
        this.editor.resize();
    };

    FieldConstructor.prototype.focus = function () {

        if (this.editor) {
            this.editor.focus();
        }

    };

    FieldConstructor.prototype.inDom = function () {

        var self = this;
        var editor = ace.edit(self._id);
        var mode = this.field.options.mode || 'javascript';

        editor.setTheme('./theme/monokai');
        editor.setPrintMarginColumn(false);
        editor.getSession().setOption('useWorker', false);
        editor.getSession().setMode('./mode/' + mode);
        editor.$blockScrolling = Infinity;

        editor.getSession().on('change', function () {

            self.setValueSilent(editor.getValue());
        });

        this.editor = editor;

        this.checkValue();
    };

    FieldConstructor.prototype.checkValue = function () {

        if (this.editor) {
            this.editor.setValue(this.value || '');
        }
    };

    return FieldConstructor;
});
