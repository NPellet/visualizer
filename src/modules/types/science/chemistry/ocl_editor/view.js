'use strict';

define(['modules/default/defaultview', 'src/util/ui', 'openchemlib'], function (
  Default,
  ui,
  OCL,
) {
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

      // Capture paste events (CTRL+V or CMD+V)
      // will be removed with https://github.com/cheminfo/openchemlib-js/issues/293
      this.dom.on('paste', (event) => {
        let clipboardData = event.originalEvent.clipboardData;
        if (!clipboardData) return;
        let pastedData = clipboardData.getData('text');
        if (!pastedData) return;

        const molecule = OCL.Molecule.fromText(pastedData);
        if (molecule) {
          setCurrentValue(this, molecule);
          event.preventDefault();
        }
      });
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
        const molecule = OCL.Molecule.fromMolfile(val);
        setCurrentValue(this, molecule);
      },
      setIDCode(val) {
        const molecule = OCL.Molecule.fromIDCode(val);
        setCurrentValue(this, molecule);
      },
      copyMolfile() {
        const molfile = this.editor.getMolecule().toMolfileV3();
        ui.copyToClipboard(molfile, {
          successMessage: 'Molfile copied to the clipboard',
        });
      },
      copyIDCode() {
        const molecule = this.editor.getMolecule();
        const idCodeAndCoordinates = molecule.getIDCodeAndCoordinates();
        ui.copyToClipboard(
          `${idCodeAndCoordinates.idCode} ${idCodeAndCoordinates.coordinates}`,
          {
            successMessage: 'IDCode copied to the clipboard',
          },
        );
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
        const molfile = this.editor.getMolecule().toMolfile();
        ui.downloadFile(molfile, 'molecule.mol', {
          mimeType: 'chemical/x-mdl-molfile',
        });
      },
    },

    update: {
      mol(val) {
        this._currentValue = val;
        this._currentType = 'mol';
        this.editor.setMolecule(OCL.Molecule.fromMolfile(String(val.get())));
        this.setFragment();
      },
      molV3(val) {
        this._currentValue = val;
        this._currentType = 'molV3';
        this.editor.setMolecule(OCL.Molecule.fromMolfile(String(val.get())));
        this.setFragment();
      },
      smiles(val) {
        this._currentValue = val;
        this._currentType = 'smiles';
        this.editor.setMolecule(OCL.Molecule.fromSmiles(String(val.get())));
        this.setFragment();
      },
      actid(val) {
        this._currentValue = val;
        this._currentType = 'oclid';
        const molecule = OCL.Molecule.fromIDCode(
          String(val.get()),
          val.coordinates || undefined,
        );
        this.editor.setMolecule(molecule);
        this.setFragment();
      },
    },

    initEditor() {
      const controller = this.module.controller;
      this.editor = new OCL.CanvasEditor(this.dom.get(0));
      this.editor.setOnChangeListener((event) =>
        controller.onChange(event, this.editor.getMolecule()),
      );
      this.editor.setMolecule(
        OCL.Molecule.fromIDCode(
          controller.currentMol.idCode,
          controller.currentMol.coordinates,
        ),
      );
      this.setFragment();
      this.resolveReady();
    },

    clearEditor() {
      this._currentValue = null;
      this._currentType = null;
      this.editor.getMolecule().clear();
      this.editor.moleculeChanged();
    },

    setFragment() {
      if (this.module.getConfigurationCheckbox('prefs', 'queryFeatures')) {
        this.editor.getMolecule().setFragment(true);
      } else {
        this.editor.getMolecule().setFragment(false);
      }
      this.editor.moleculeChanged();
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
    self.editor.setMolecule(molecule);
    self.setFragment();
  }

  return View;
});
