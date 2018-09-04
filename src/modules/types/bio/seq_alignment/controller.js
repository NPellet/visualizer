'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Sequence alignment displayer',
    description: 'Displays DNA sequence with annotations',
    author: 'Daniel Kostro',
    date: '12.06.2014',
    license: 'MIT',
    cssClass: 'sequence_display'
  };

  Controller.prototype.references = {
    sequences: {
      label: 'Array of sequences to align'
    }
  };

  Controller.prototype.variablesIn = ['sequences'];

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {

        group: {
          options: {
            type: 'list',
            multiple: false
          },
          fields: {
            colorSchema: {
              type: 'combo',
              title: 'Slick options',
              options: [
                { title: 'Default', key: 'default' },
                { title: 'Match', key: 'match' }
              ]
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    colorSchema: ['groups', 'group', 0, 'colorSchema', 0]
  };
  return Controller;
});
