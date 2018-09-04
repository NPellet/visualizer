'use strict';

define(['modules/types/display/jqgrid/controller', 'src/util/util'], function (Controller, Util) {
  function ControllerExtended() {
    Controller.call(this);
  }

  Util.inherits(ControllerExtended, Controller);

  ControllerExtended.prototype.moduleInformation = {
    name: 'Table (fast)',
    description: 'Displays a fast grid',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: 'fasttable'
  };

  ControllerExtended.prototype.references.showList = {
    label: 'Array of display flags',
    type: 'array'
  };

  ControllerExtended.prototype.variablesIn.push('showList');
  ControllerExtended.prototype.actionsIn.toggleOff = 'Toggle row off';
  ControllerExtended.prototype.actionsIn.toggleOn = 'Toggle row on';

  return ControllerExtended;
});
