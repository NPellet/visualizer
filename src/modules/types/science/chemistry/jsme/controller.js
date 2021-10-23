'use strict';

define(['modules/default/defaultcontroller', 'src/util/ui'], function (
  Default,
  ui,
) {
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.getToolbar = function () {
    var base = Default.getToolbar.call(this);
    base.unshift({
      onClick: function () {
        var w = $(window).width();
        var h = $(window).height();
        var url = require.toUrl(
          'modules/types/science/chemistry/jsme/help/index.html',
        );
        ui.dialog(
          `<iframe src=${url} width="100%", height="100%" frameBorder="0"></iframe>`,
          {
            width: Math.min(w - 40, 800),
            height: h - 70,
            title: 'JSME Help',
          },
        );
      },
      title: 'Help',
      cssClass: 'fa fa-question',
      ifLocked: true,
    });
    return base;
  };

  Controller.prototype.moduleInformation = {
    name: 'JSME',
    description: 'Displays and interacts with the JSME plugin',
    author: 'Norman Pellet, Luc Patiny',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: 'jsme',
  };

  Controller.prototype.references = {
    mol: {
      label: 'Molfile V2 2D',
      type: ['mol2d', 'molfile2d', 'string'],
    },
    smiles: {
      label: 'SMILES',
      type: ['smiles', 'string'],
    },
    jme: {
      label: 'JME file format',
      type: ['jme', 'string'],
    },
    svg: {
      label: 'SVG containing the picture',
      type: ['svg', 'string'],
    },
    molV3: {
      label: 'Molfile V3 2D',
      type: ['mol2d', 'molfile2d', 'string'],
    },
    atom: {
      label: 'Atom',
    },
    bond: {
      label: 'Bond',
    },
  };

  Controller.prototype.events = {
    onStructureChange: {
      label: 'Molecular structure has changed',
      refVariable: ['mol', 'smiles', 'jme', 'molV3', 'svg'],
    },
    onAtomClicked: {
      label: 'An atom was clicked',
      refAction: ['atom'],
    },
    onBondClicked: {
      label: 'A bond was clicked',
      refAction: ['bond'],
    },
    onAtomHover: {
      label: 'An atom was hovered',
      refAction: ['atom'],
    },
    onBondHover: {
      label: 'A bond was hovered',
      refAction: ['bond'],
    },
    onMolfileLoaded: {
      label: 'A non empty molfile was loaded',
      refAction: ['mol'],
    },
  };

  Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
    setOptions: 'Set JSME options',
  });

  Controller.prototype.variablesIn = ['mol', 'jme', 'smiles'];

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list',
          },
          fields: {
            prefs: {
              type: 'checkbox',
              title: 'Options',
              default: ['oldlook', 'nozoom', 'useopenchemlib'],
              options: {
                noxbutton: 'Hide X button',
                rbutton: 'Show R button',
                nohydrogens: 'Hide hydrogens',
                query: 'Enable query features',
                autoez:
                  'Automatic generation of SMILES with E,Z stereochemistry',
                nocanonize:
                  'Prevent canonicalization and detection of aromaticity',
                nostereo: 'No stereochemistry in SMILES',
                reaction: 'Enable reaction input',
                nomultipart: "Don't allow multipart structures",
                polarnitro: "Don't convert automatically nitro to unpolar form",
                number: 'Allow to number atoms',
                depict: 'Only display structure (no editing)',
                nopaste: 'Remove the paste menu',
                border:
                  'With depict option, display the border around the molecule',
                star:
                  'Display star button allowing highlight of atoms (placed in the smiles)',
                depictaction: 'Allows to specify an action in depict mode',
                oldlook: 'Use the old look',
                atommovebutton: 'Add button to move atoms',
                removehs:
                  'Remove hydrogens when reading a molecule with explicit hydrogens',
                removehsc:
                  'Remove hydrogens bounded to C when reading a molecule with explicit hydrogens',
                nozoom: 'Prevent zoom with scroll wheel',
                toggle: 'Allow to switch from edition to depict mode',
                noshowdraganddropsymbolindepictmode:
                  'Hide the drag and drop symbol in depict mode',
                addnewpart:
                  'when reading or pasting a new molecule, add it to the existing molecules',
                useopenchemlib:
                  'use OpenChemLib library for SMILES conversion, 2D coordinates computation and SVG export',
                exportSVG: 'enable / disable the menu item for SVG export',
                nocontextmenu: 'Disable context menu',
              },
            },
            defaultaction: {
              type: 'combo',
              title: 'Default action',
              options: [{ title: 'Mark action', key: '105' }],
            },
            labelsize: {
              type: 'combo',
              title: 'Label size',
              options: [
                { title: '6pt', key: '6' },
                { title: '7pt', key: '7' },
                { title: '8pt', key: '8' },
                { title: '9pt', key: '9' },
                { title: '10pt', key: '10' },
                { title: '11pt', key: '11' },
                { title: '12pt', key: '12' },
                { title: '13pt', key: '13' },
                { title: '14pt', key: '14' },
                { title: '16pt', key: '16' },
                { title: '18pt', key: '18' },
                { title: '24pt', key: '24' },
              ],
              default: 14,
            },
            bondwidth: {
              type: 'combo',
              title: 'Bond width',
              options: [
                { title: '1px', key: '1' },
                { title: '1.5px', key: '1.5' },
                { title: '2px', key: '2' },
              ],
              default: 1,
            },
            highlightColor: {
              type: 'combo',
              title: 'Atom highlight color',
              options: [
                { title: 'red', key: '1' },
                { title: 'orange', key: '2' },
                { title: 'yellow', key: '3' },
                { title: 'cyan', key: '4' },
                { title: 'blue', key: '5' },
                { title: 'purple', key: '6' },
              ],
              default: '3',
            },
            outputResult: {
              type: 'checkbox',
              title: 'Modify Input Variable',
              options: { yes: 'Yes' },
              default: [],
            },
          },
        },
      },
    };
  };

  /*
   * We receive an event from JSME
   */
  Controller.prototype.onChange = function (message) {
    var action = message.action;
    var currentValue = this.module.view._currentValue;
    // check Github History when drag / drop and paste will be another action name
    if (
      action != null &&
      ((action !== 'readRXNFile' && action !== 'readMolFile') ||
        message.origin === 'GUI' ||
        message.origin === 'PASTE') &&
      action !== 'reset' &&
      currentValue &&
      this.module.getConfigurationCheckbox('outputResult', 'yes')
    ) {
      if (this.module.view._currentType === 'mol') {
        currentValue.setValue(message.mol, true);
        this.module.model.dataTriggerChange(currentValue);
      } else if (this.module.view._currentType === 'jme') {
        currentValue.setValue(message.jme, true);
        this.module.model.dataTriggerChange(currentValue);
      } else if (this.module.view._currentType === 'smiles') {
        currentValue.setValue(message.smiles, true);
        this.module.model.dataTriggerChange(currentValue);
      }
    }

    // we loaded an external file
    if (action === 'readMolFile' && message.smiles !== '') {
      this.sendActionFromEvent('onMolfileLoaded', 'mol', message.mol);
    }

    // Always create smiles because smiles is not a possible input variable
    this.createDataFromEvent('onStructureChange', 'smiles', message.smiles);
    this.createDataFromEvent('onStructureChange', 'svg', {
      type: 'svg',
      value: message.svg,
    });
    this.createDataFromEvent('onStructureChange', 'mol', {
      type: 'mol2d',
      value: message.mol,
    });
    this.createDataFromEvent('onStructureChange', 'molV3', {
      type: 'mol2d',
      value: message.molV3,
    });
    this.createDataFromEvent('onStructureChange', 'jme', {
      type: 'jme',
      value: message.jme,
    });
  };

  Controller.prototype.getHighlights = function (atom) {
    if (
      !this.module.view._currentValue ||
      !this.module.view._currentValue._atoms
    )
      return;
    var atoms = this.module.view._currentValue._atoms;
    var highlights = [];
    for (var key of Object.keys(atoms)) {
      if (atoms[key].includes(atom)) {
        highlights.push(key);
      }
    }
    return highlights;
  };

  Controller.prototype.onAtomClick = function (atom) {
    atom.highlights = this.getHighlights(atom.atom - 1);
    this.sendActionFromEvent('onAtomClicked', 'atom', atom);
  };

  Controller.prototype.onAtomHover = function (atom) {
    atom.highlights = this.getHighlights(atom.atom - 1);
    this.sendActionFromEvent('onAtomHover', 'atom', atom);
  };

  Controller.prototype.onBondClick = function (bond) {
    this.sendActionFromEvent('onBondClicked', 'bond', bond);
  };

  Controller.prototype.onBondHover = function (bond) {
    this.sendActionFromEvent('onBondHover', 'bond', bond);
  };

  Controller.prototype.onMolfileLoaded = function (molfile) {
    this.sendActionFromEvent('onMolfileLoaded', 'mol', molfile);
  };

  Controller.prototype.configAliases = {
    prefs: ['groups', 'group', 0, 'prefs', 0],
    labelsize: ['groups', 'group', 0, 'labelsize', 0],
    bondwidth: ['groups', 'group', 0, 'bondwidth', 0],
    defaultaction: ['groups', 'group', 0, 'defaultaction', 0],
    highlightColor: ['groups', 'group', 0, 'highlightColor', 0],
    outputResult: ['groups', 'group', 0, 'outputResult', 0],
  };

  Controller.prototype.onRemove = function () {
    this.module.view.remove(this.module.getId());
  };

  return Controller;
});
