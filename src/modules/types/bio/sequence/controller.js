'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Sequence displayer',
    description: 'Displays DNA sequence with annotations',
    author: 'Daniel Kostro',
    date: '12.06.2014',
    license: 'MIT',
    cssClass: 'sequence_display'
  };

  Controller.prototype.references = {
    sequence: {
      label: 'An Amino Acid Sequence'
    },
    annotations: {
      label: 'Sequence annotations'
    },
    range: {
      label: 'Sequence range'
    }
  };

  Controller.prototype.events = {
    onSequenceSelectionChanged: {
      label: 'A sequence was selected',
      refVariable: ['range', 'sequence']
    }
  };

  Controller.prototype.onSequenceSelectionChanged = function (val) {
    this.createDataFromEvent('onSequenceSelectionChanged', 'range', val);
    this.createDataFromEvent('onSequenceSelectionChanged', 'sequence', String(this.module.view.sequence).substr(val.start - 1, val.end - val.start + 1));
  };

  Controller.prototype.variablesIn = ['sequence', 'annotations'];

  return Controller;
});
