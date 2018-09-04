'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'lib/formcreator/formcreator'], function (Default, Traversing, FormCreator) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Configured array filter',
    description: 'Filters an array with configured UI criteria',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: 'configured_search'
  };

  Controller.prototype.references = {
    array: {
      label: 'An input array', // The input array is never modified
      type: 'array'
    },

    filteredArray: {
      label: 'Filtered array',
      type: 'array'
    },

    flagArray: {
      label: 'Array of booleans',
      type: 'array'
    },
    countResult: {
      type: 'number',
      label: 'Number of selected items'
    }
  };

  Controller.prototype.events = {
    onSearchDone: {
      label: 'When a search is performed',
      refVariable: ['filteredArray', 'flagArray'],
      refAction: ['filteredArray', 'flagArray', 'countResult']
    }
  };

  Controller.prototype.variablesIn = ['array'];

  Controller.prototype.actionsIn = {
    disable: 'Disable the search'
  };

  Controller.prototype.configurationStructure = function () {
    var all_jpaths = [],
      arr = this.module.getDataFromRel('array');

    if (arr) {
      arr = arr.get();
      Traversing.getJPathsFromElement(arr[0], all_jpaths);
    }

    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            max: {
              type: 'text',
              title: 'Maximum hits',
              default: '50'
            },
            disableMessage: {
              type: 'text',
              title: 'Disable message',
              default: 'Click to enable search'
            }
          }
        }
      },
      sections: {
        searchFields: FormCreator.makeConfig({
          name: 'Search on',
          jpaths: all_jpaths
        }, { name: 'Comparison' })
      }
    };
  };

  Controller.prototype.searchDone = function (arr, flags) {
    // Sets the variable corresponding to the onSearchDone event

    this.createDataFromEvent('onSearchDone', 'flagArray', flags);
    this.sendActionFromEvent('onSearchDone', 'flagArray', flags);

    this.createDataFromEvent('onSearchDone', 'filteredArray', arr);
    this.sendActionFromEvent('onSearchDone', 'filteredArray', arr);
    this.createDataFromEvent('onSearchDone', 'countResult', arr.length);
  };

  Controller.prototype.configFunctions = {
    searchfields: function (cfg) {
      if (!Array.isArray(cfg)) {
        return [];
      }
      return cfg;
    }
  };

  Controller.prototype.configAliases = {
    searchfields: ['sections', 'searchFields'],
    maxhits: ['groups', 'group', 0, 'max', 0],
    disableMessage: ['groups', 'group', 0, 'disableMessage', 0]
  };

  return Controller;
});
