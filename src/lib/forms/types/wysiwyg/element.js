'use strict';

define(['require', 'jquery', 'src/util/util', 'ckeditor'], function (require, $, Util, CKEDITOR) {

    CKEDITOR.disableAutoInline = true;

    var FieldConstructor = function () {
    };

    FieldConstructor.prototype.__makeDom = function () {

        this._id = Util.getNextUniqueId();

        var dom = $('<div />'),
            input = $('<div />', {name: this._id})
                .addClass('field-list')
                .appendTo(dom);

        this.dom = dom;
        return dom;
    };


    FieldConstructor.prototype.inDom = function () {

        var self = this;

        var uri = require.toUrl('./ckeditor_config.js');
        if (!uri.startsWith('http') && !uri.startsWith('//') && !uri.startsWith('https')) {
            uri = '../../' + uri;
        }

        this._editor = CKEDITOR.replace(this._id, {
            customConfig: uri,
            extraPlugins: 'onchange'
        });

        this._editor.on('change', function () {

            if (self._editor.checkDirty()) {

                self.setValueSilent(self._editor.getData());

            }
        });

        this.checkValue();
    };

    FieldConstructor.prototype.checkValue = function () {

        if (this._editor) {
            this._editor.setData(this.value);
        }
    };

    return FieldConstructor;
});