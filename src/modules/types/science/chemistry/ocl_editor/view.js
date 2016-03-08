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
                    height: '99%',
                    width: '100%'
                });
            this.module.getDomContent().html(this.dom);
        },

        onResize: function () {
            this.dom.empty();
            this.initEditor();
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
                this._currentValue = val;
                this._currentType = 'mol';
                this.editor.setMolFile(String(val.get()));
                this.setFragment();
            },
            smiles: function (val) {
                this._currentValue = val;
                this._currentType = 'smiles';
                this.editor.setSmiles(String(val.get()));
                this.setFragment();
            },
            actid: function (val) {
                this._currentValue = val;
                this._currentType = 'oclid';
                var value = String(val.get());
                if (val.coordinates) {
                    value += ' ' + val.coordinates;
                }
                this.editor.setIDCode(value);
                this.setFragment();
            }
        },

        initEditor: function () {
            var controller = this.module.controller;
            this.editor = OCL.StructureEditor.createEditor(this.id);
            this.editor.setChangeListenerCallback(this.module.controller.onChange.bind(controller));
            this.editor.setIDCode(controller.currentMol.idcode, controller.currentMol.coordinates);
            this.setFragment();
            this.resolveReady();
        },

        clearEditor: function () {
            this._currentValue = null;
            this._currentType = null;
            this.editor.setIDCode('');
        },

        setFragment: function () {
            if (this.module.getConfigurationCheckbox('prefs', 'queryFeatures')) {
                this.editor.setFragment(true);
            } else {
                this.editor.setFragment(false);
            }
        }

    });

    return View;

});
