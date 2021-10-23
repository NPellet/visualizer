'use strict';

define([
  'jquery',
  'modules/default/defaultcontroller',
  'smart-array-filter',
], function ($, Default, SAF) {
  const filter = SAF.filter;
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Smart array filter',
    description:
      'Use simple text queries to search in an array of complex objects.',
    author: 'Michaël Zasso',
    date: '06.11.2015',
    license: 'MIT',
    cssClass: 'smart_array_filter',
  };

  Controller.prototype.references = {
    input: {
      label: 'Input array',
      type: 'array',
    },
    output: {
      label: 'Output array',
      type: 'array',
    },
    search: {
      label: 'Search string',
      type: 'string',
    },
  };

  Controller.prototype.events = {
    onQuery: {
      label: 'Query is changed',
      refVariable: ['output', 'search'],
    },
  };

  Controller.prototype.variablesIn = ['input'];

  Controller.prototype.actionsIn = {
    clearQuery: 'Clear current query',
    setQuery: 'Set query',
    appendQuery: 'Append to current query',
  };

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list',
          },
          fields: {
            debounce: {
              type: 'float',
              title: 'Search debouncing (ms)',
              default: 100,
            },
            limit: {
              type: 'float',
              title: 'Limit output length (0 to disable)',
              default: 0,
            },
            initialValue: {
              type: 'text',
              title: 'Initial value',
              default: '',
            },
            placeholder: {
              type: 'text',
              title: 'Placeholder',
              default: '',
            },
            fontSize: {
              type: 'float',
              title: 'Font size',
              default: 20,
            },
          },
        },
      },
    };
  };

  Controller.prototype.configAliases = {
    debounce: ['groups', 'group', 0, 'debounce', 0],
    limit: ['groups', 'group', 0, 'limit', 0],
    initialValue: ['groups', 'group', 0, 'initialValue', 0],
    placeholder: ['groups', 'group', 0, 'placeholder', 0],
    fontSize: ['groups', 'group', 0, 'fontSize', 0],
  };

  Controller.prototype.onQuery = function (query) {
    if (!this.module.view._data) return;
    var array = DataObject.resurrect(this.module.view._data);
    var result = filter(array, {
      keywords: query,
      index: true,
      limit: this.module.getConfiguration('limit', 0),
    });
    var original = this.module.view._originalData;
    var toSend = new Array(result.length);
    for (var i = 0; i < result.length; i++) {
      toSend[i] = original[result[i]];
    }
    this.createDataFromEvent('onQuery', 'search', query);
    this.createDataFromEvent('onQuery', 'output', toSend);
  };

  return Controller;
});
