'use strict';

define([
  'modules/default/defaultcontroller',
  'openchemlib',
  'src/util/ui',
], function (Default, OCL, ui) {
  function Controller() {
    this.currentMol = { idCode: '', coordinates: '' };
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.getToolbar = function () {
    var base = Default.getToolbar.call(this);
    base.unshift({
      onClick() {
        var w = $(window).width();
        var h = $(window).height();
        var url = require.toUrl(
          'modules/types/science/chemistry/ocl_editor/help.html',
        );
        ui.dialog(
          `<iframe src=${url} width="100%", height="100%" frameBorder="0"></iframe>`,
          {
            width: Math.min(w - 40, 800),
            height: h - 70,
            title: 'OpenChemLib editor Help',
          },
        );
      },
      title: 'Help',
      cssClass: 'fa fa-question',
      ifLocked: true,
    });
    base.unshift({
      onClick: () => {
        if (navigator.clipboard) {
          navigator.clipboard.readText().then((text) => {
            if (text.split('\n').length > 4) {
              this.module.view.onActionReceive.setMolfile.call(
                this.module.view,
                text,
              );
              return;
            }
            // could be either a SMILES or an IDCode
            try {
              text = OCL.Molecule.fromSmiles(text).toMolfileV3();
              this.module.view.onActionReceive.setMolfile.call(
                this.module.view,
                text,
              );
              return;
            } catch {
              // not a smiles, we expect it is an idCode
            }
            this.module.view.onActionReceive.setIDCode.call(
              this.module.view,
              text,
            );
          });
        }
      },
      title: 'Import molfile, SMILES or IDCode from clipboard',
      cssClass: 'fa fa-paste',
      ifLocked: true,
    });
    base.unshift({
      onClick: () => {
        this.module.view.onActionReceive.copyIDCode.call(this.module.view);
      },
      title: 'Copy idCode (unique ID from OCL Editor)',
      cssClass: 'fa fa-fingerprint',
      ifLocked: true,
    });
    base.unshift({
      onClick: () => {
        this.module.view.onActionReceive.copyMolfile.call(this.module.view);
      },
      title: 'Copy Molfile V3 to clipboard',
      cssClass: 'fa fa-copy',
      ifLocked: true,
    });
    base.unshift({
      onClick: () => {
        this.module.view.onActionReceive.downloadSvg.call(this.module.view);
      },
      title: 'Download as SVG vector file',
      cssClass: 'fa fa-image',
      ifLocked: true,
    });
    base.unshift({
      onClick: () => {
        this.module.view.onActionReceive.downloadMolfile.call(this.module.view);
      },
      title: 'Download as molfile',
      cssClass: 'fa fa-download',
      ifLocked: true,
    });
    return base;
  };

  Controller.prototype.moduleInformation = {
    name: 'OCL Molecule editor',
    description: 'Molecule editor using the openchemlib javascript library',
    author: 'Michael Zasso',
    date: '11.05.2015',
    license: 'BSD',
    cssClass: 'ocl_editor',
  };

  Controller.prototype.references = {
    mol: { label: 'Molfile 2D' },
    molV3: { label: 'Molfile V3 2D' },
    smiles: { label: 'Smiles' },
    actid: { label: 'OCL molecule ID' },
    actidOrGroup: { label: 'OCL molecule ID. Distinguish racemic OR group.' },
  };

  Controller.prototype.variablesIn = ['mol', 'molV3', 'smiles', 'actid'];

  Controller.prototype.events = {
    onStructureChange: {
      label: 'Molecular structure has changed',
      refVariable: ['mol', 'molV3', 'smiles', 'actid', 'actidOrGroup'],
    },
  };

  Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
    setMolfile: 'Set molecule from molfile',
    setIDCode: 'Set molecule from idCode',
    downloadSvg: 'Download molecule as SVG',
    copyMolfile: 'Copy Molfile to clipboard',
  });

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: { type: 'list' },
          fields: {
            prefs: {
              type: 'checkbox',
              title: 'Options',
              default: ['svg'],
              options: {
                queryFeatures: 'Enable query features',
                inPlace: 'Modify input variable',
              },
            },
          },
        },
      },
    };
  };

  Controller.prototype.configAliases = {
    prefs: ['groups', 'group', 0, 'prefs', 0],
  };

  Controller.prototype.onChange = function (event, molecule) {
    const inPlace = this.module.getConfigurationCheckbox('prefs', 'inPlace');

    // In modify variable in mode
    // When the module is blanked we consider it local state
    // And we don't send out updates
    // This also prevents infinite recursiveness
    if (inPlace && this.module.view._currentValue === null) {
      return;
    }
    const idCodeAndCoordinates = molecule.getIDCodeAndCoordinates();
    const split = [
      idCodeAndCoordinates.idCode,
      idCodeAndCoordinates.coordinates,
    ];

    const idCodeOr = molecule.getCanonizedIDCode(
      OCL.Molecule.CANONIZER_DISTINGUISH_RACEMIC_OR_GROUPS,
    );
    const idCode = split[0];
    const coordinates = split[1];

    if (
      idCodeOr !== this.currentMol.idCodeOr
      // coordinates !== this.currentMol.coordinates
    ) {
      this.currentMol = { coordinates, idCode, idCodeOr };
      var molfile = molecule.toMolfile();
      var molfileV3 = molecule.toMolfileV3();
      var smiles = molecule.toSmiles();
      this.createDataFromEvent('onStructureChange', 'mol', molfile);
      this.createDataFromEvent('onStructureChange', 'molV3', molfileV3);
      this.createDataFromEvent('onStructureChange', 'smiles', smiles);
      this.createDataFromEvent('onStructureChange', 'actid', {
        value: split[0],
        coordinates: split[1],
      });
      this.createDataFromEvent('onStructureChange', 'actidOrGroup', {
        value: idCodeOr,
        coordinates,
      });

      // inplace modification is disabled for now because of unexpected
      // change events
      if (inPlace && this.module.view._currentType) {
        var currentValue = this.module.view._currentValue;
        switch (this.module.view._currentType) {
          case 'mol':
            currentValue.setValue(molfile);
            break;
          case 'molV3':
            currentValue.setValue(molfileV3);
            break;
          case 'smiles':
            currentValue.setValue(smiles);
            break;
          case 'oclid':
            if (currentValue.value) {
              currentValue.coordinates = split[1];
            }
            currentValue.setValue(split[0]);
            break;
          default:
            throw new Error('invalid structure format type');
        }
        this.module.model.dataTriggerChange(currentValue);
      }
    }
  };

  return Controller;
});
