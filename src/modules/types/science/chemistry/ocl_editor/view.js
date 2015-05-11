'use strict';

define(['modules/default/defaultview', 'src/util/util', 'openchemlib/openchemlib-full'], function (Default, Util, OCL) {

    function View() {
        this.id = Util.getNextUniqueId();
    }

    $.extend(true, View.prototype, Default, {

        init: function () {
            this.editor = null;
        },

        inDom: function () {
            this.dom = $('<div>')
                .attr('id', this.id)
                .css({
                    height: '100%',
                    width: '100%'
                });
            this.module.getDomContent().html(this.dom);
        },

        onResize: function () {
            if (!this.editor) {
                this.initEditor();
            }
        },

        blank: {
            mol: function () {
                this.clearEditor();
            },
            smiles: function () {
                this.clearEditor();
            },
            actid: function () {
                this.clearEditor();
            }
        },

        update: {
            mol: function (val) {
                this.editor.setMolFile(String(val.get()));
            },
            smiles: function (val) {
                this.editor.setSmiles(String(val.get()));
            },
            actid: function (val) {
                var value = String(val.get());
                if (value.coordinates) {
                    value += ' ' + value.coordinates;
                }
                this.editor.setIDCode(value);
            }
        },

        initEditor: function () {
            this.editor = OCL.StructureEditor.createEditor(this.id);
            this.editor.setChangeListenerCallback(this.module.controller.onChange.bind(this.module.controller));
            this.resolveReady();
        },

        clearEditor: function () {
            this.editor.setIDCode('');
        }

    });

    return View;

});
