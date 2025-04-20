'use strict';

define([
  'modules/default/defaultview',
  'src/util/ui',
  'openchemlib/openchemlib-full',
], function (Default, ui, OCL) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      this.editor = null;
    },

    inDom() {
      this.dom = $('<div>').css({
        height: '99%',
        width: '100%',
      });
      this.module.getDomContent().html(this.dom);
    },

    onResize() {
      this.dom.empty();
      this.initEditor();
    },

    blank: {
      mol() {
        this.clearEditor();
      },
      molV3() {
        this.clearEditor();
      },
      smiles() {
        this.clearEditor();
      },
      actid() {
        this.clearEditor();
      },
    },

    onActionReceive: {
      setMolfile(val) {
        const molecule = OCL.Molecule.formMolfile(val);
        setCurrentValue(this, molecule);
      },
      setIDCode(val) {
        const molecule = OCL.Molecule.fromIDCode(val);
        setCurrentValue(this, molecule);
      },
      copyMolfile() {
        const molfile = this.editor.getMolFileV3();
        ui.copyToClipboard(molfile, {
          successMessage: 'Molfile copied to the clipboard',
        });
      },
      copyIDCode() {
        const idCode = this.editor.getIDCode();
        ui.copyToClipboard(idCode, {
          successMessage: 'IDCode copied to the clipboard',
        });
      },
      downloadSvg(value = {}) {
        const { width = 800, height = 600 } = value;
        const molecule = this.editor.getMolecule();
        const svg = molecule.toSVG(width, height);
        ui.downloadFile(svg, 'molecule.svg', {
          mimeType: 'application/svg;charset=utf-8',
        });
      },
      downloadMolfile() {
        const molfile = this.editor.getMolFile();
        ui.downloadFile(molfile, 'molecule.mol', {
          mimeType: 'chemical/x-mdl-molfile',
        });
      },
    },

    update: {
      mol(val) {
        this._currentValue = val;
        this._currentType = 'mol';
        this.editor.setMolFile(String(val.get()));
        this.setFragment();
      },
      molV3(val) {
        this._currentValue = val;
        this._currentType = 'molV3';
        this.editor.setMolFile(String(val.get()));
        this.setFragment();
      },
      smiles(val) {
        this._currentValue = val;
        this._currentType = 'smiles';
        this.editor.setSmiles(String(val.get()));
        this.setFragment();
      },
      actid(val) {
        this._currentValue = val;
        this._currentType = 'oclid';
        var value = String(val.get());
        if (val.coordinates) {
          value += ` ${val.coordinates}`;
        }
        this.editor.setIDCode(value);
        this.setFragment();
      },
    },

    initEditor() {
      var controller = this.module.controller;
      var useSVG = this.module.getConfigurationCheckbox('prefs', 'svg');
      this.editor = new OCL.StructureEditor(this.dom.get(0), useSVG, 1);
      this.editor.setChangeListenerCallback(
        this.module.controller.onChange.bind(controller),
      );
      this.editor.setIDCode(
        `${controller.currentMol.idCode} ${controller.currentMol.coordinates}`,
      );
      this.setFragment();
      this.resolveReady();
    },

    clearEditor() {
      this._currentValue = null;
      this._currentType = null;
      this.editor.setIDCode('');
    },

    setFragment() {
      if (this.module.getConfigurationCheckbox('prefs', 'queryFeatures')) {
        this.editor.setFragment(true);
      } else {
        this.editor.setFragment(false);
      }
    },
  });

  function setCurrentValue(self, molecule) {
    const setValue = (value) => {
      if (self._currentValue && self._currentValue.setValue) {
        self._currentValue.setValue(value);
      } else {
        self._currentValue = value;
      }
    };

    switch (self._currentType) {
      case 'mol':
        setValue(molecule.toMolfile());
        break;
      case 'molV3':
        setValue(molecule.toMolfileV3());
        break;
      case 'smiles':
        setValue(molecule.toSmiles());
        break;
      case 'oclid':
        setValue(molecule.getIDCode());
        break;
      default:
        self._currentType = 'molV3';
        self._currentValue = molecule.toMolfileV3();
    }
    self.editor.setIDCode(molecule.getIDCode());
    self.setFragment();
  }

  return View;
});
