'use strict';

define([
  'modules/default/defaultview',
  'src/util/ui',
  'openchemlib/openchemlib-full'
], function (Default, ui, OCL) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init: function () {
      this.editor = null;
    },

    inDom: function () {
      this.dom = $('<div>')
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
      molV3: function () {
        this.clearEditor();
      },
      smiles: function () {
        this.clearEditor();
      },
      actid: function () {
        this.clearEditor();
      }
    },

    onActionReceive: {
      setMolfile: function (val) {
        if (this._currentValue && this._currentValue.setValue) {
          this._currentValue.setValue(val);
        } else {
          this._currentValue = val;
        }
        this._currentType = 'molV3';
        this.editor.setMolFile(val);
        this.setFragment();
      },
      copyMolfile: function () {
        const molfile = this.editor.getMolFileV3();
        ui.copyToClipboard(molfile, {
          successMessage: 'Molfile copied to the clipboard'
        });
      },
      downloadSvg: function (value = {}) {
        const { width = 800, height = 600 } = value;
        const molecule = this.editor.getMolecule();
        const svg = molecule.toSVG(width, height);
        ui.downloadFile(svg, 'molecule.svg', {
          mimeType: 'application/svg;charset=utf-8'
        });
      }
    },

    update: {
      mol: function (val) {
        this._currentValue = val;
        this._currentType = 'mol';
        this.editor.setMolFile(String(val.get()));
        this.setFragment();
      },
      molV3: function (val) {
        this._currentValue = val;
        this._currentType = 'molV3';
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
          value += ` ${val.coordinates}`;
        }
        this.editor.setIDCode(value);
        this.setFragment();
      }
    },

    initEditor: function () {
      var controller = this.module.controller;
      var useSVG = this.module.getConfigurationCheckbox('prefs', 'svg');
      this.editor = new OCL.StructureEditor(this.dom.get(0), useSVG, 1);
      this.editor.setChangeListenerCallback(
        this.module.controller.onChange.bind(controller)
      );
      this.editor.setIDCode(
        `${controller.currentMol.idCode} ${controller.currentMol.coordinates}`
      );
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
