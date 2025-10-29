'use strict';

define([
  'modules/default/defaultcontroller',
  'openchemlib',
  'src/util/ui',
], function (Default, OCL, ui) {
  function Controller() {
    this.currentReaction = '';
  }

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
    return base;
  };

  Controller.prototype.moduleInformation = {
    name: 'OCL Reaction editor',
    description: 'Reaction editor using the OpenChemLib JavaScript library',
    author: 'Michael Zasso',
    date: '29.10.2025',
    license: 'BSD',
    cssClass: 'ocl_reaction_editor',
  };

  Controller.prototype.references = {};

  Controller.prototype.variablesIn = [];

  Controller.prototype.events = {};

  Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {});

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
    const inPlace = this.module.getConfigurationCheckbox('prefs', 'inPlace');

    // TODO: handle reaction change
  };

  return Controller;
});
