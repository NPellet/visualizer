'use strict';

define([
  'modules/default/defaultcontroller',
  'openchemlib',
  'src/util/ui',
], function (Default, OCL, ui) {
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.getToolbar = function () {
    const base = Default.getToolbar.call(this);
    base.unshift({
      onClick() {
        const w = $(window).width();
        const h = $(window).height();
        const url = require.toUrl(
          'modules/types/science/chemistry/ocl_editor/help.html',
        );
        ui.dialog(
          `<iframe src=${url} width="100%" height="100%" frameBorder="0"></iframe>`,
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
            this.module.view.onActionReceive.addProduct.call(
              this.module.view,
              text,
            );
          });
        }
      },
      title: 'Add product from clipboard (RXN, SMILES or ID code)',
      cssClass: 'fa fa-paste',
      ifLocked: true,
    });
    base.unshift({
      onClick: () => {
        if (navigator.clipboard) {
          navigator.clipboard.readText().then((text) => {
            this.module.view.onActionReceive.addReactant.call(
              this.module.view,
              text,
            );
          });
        }
      },
      title: 'Add reactant from clipboard (RXN, SMILES or ID code)',
      cssClass: 'fa fa-paste',
      ifLocked: true,
    });
    base.unshift({
      onClick: () => {
        const rxnV3 = this.module.view.editor.getReaction().toRxnV3();
        ui.copyToClipboard(rxnV3, {
          successMessage: 'RXN V3000 copied to the clipboard',
        });
      },
      title: 'Copy RXN V3000 to clipboard',
      cssClass: 'fa fa-copy',
      ifLocked: true,
    });
    return base;
  };

  Controller.prototype.moduleInformation = {
    name: 'OCL Reaction Editor',
    description: 'Reaction editor using the OpenChemLib JavaScript library',
    author: 'Michael Zasso',
    date: '29.10.2025',
    license: 'BSD',
    cssClass: 'ocl_reaction_editor',
  };

  Controller.prototype.references = {
    rxn: { label: 'RXN V2000' },
    rxnV3: { label: 'RXN V3000' },
    smiles: { label: 'SMILES' },
    reactionIdCode: { label: 'OCL reaction ID code' },
  };

  Controller.prototype.variablesIn = [
    'rxn',
    'rxnV3',
    'smiles',
    'reactionIdCode',
  ];

  Controller.prototype.events = {
    onReactionChange: {
      label: 'Reaction has changed',
      refVariable: ['rxn', 'rxnV3', 'smiles', 'reactionIdCode'],
    },
  };

  Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
    addReactant: 'Add a reactant from text (molfile, SMILES, or ID code)',
    addProduct: 'Add a product from text (molfile, SMILES, or ID code)',
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

  Controller.prototype.onChange = function (event, reaction) {
    if (!event.isUserEvent) return;
    const inPlace = this.module.getConfigurationCheckbox('prefs', 'inPlace');
    const idCode = OCL.ReactionEncoder.encode(reaction) || '';
    const rxn = reaction.toRxn();
    const rxnV3 = reaction.toRxnV3();
    const smiles = reaction.toSmiles();
    this.createDataFromEvent('onReactionChange', 'rxn', rxn);
    this.createDataFromEvent('onReactionChange', 'rxnV3', rxnV3);
    this.createDataFromEvent('onReactionChange', 'smiles', smiles);
    this.createDataFromEvent('onReactionChange', 'reactionIdCode', idCode);

    if (inPlace && this.module.view._currentType) {
      const currentValue = this.module.view._currentValue;
      switch (this.module.view._currentType) {
        case 'rxn':
          currentValue.setValue(rxn);
          break;
        case 'rxnV3':
          currentValue.setValue(rxnV3);
          break;
        case 'smiles':
          currentValue.setValue(smiles);
          break;
        case 'reactionIdCode':
          currentValue.setValue(idCode);
          break;
        default:
          throw new Error('invalid reaction value type');
      }
      this.module.model.dataTriggerChange(currentValue);
    }
  };

  return Controller;
});
