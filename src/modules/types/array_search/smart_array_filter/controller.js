'use strict';

define([
  'jquery',
  'modules/default/defaultcontroller',
  'smart-array-filter',
], function($, Default, SAF) {
  const filter = SAF.filter;

  function isRegExpString(value) {
    return /^\/.*\/$/.exec(value);
  }

  function convertStrToRegexp(value) {
    return isRegExpString(value) ? new RegExp(value.slice(1, -1)) : value;
  }
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

  Controller.prototype.configurationStructure = function() {
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
            predicate: {
              type: 'combo',
              title: 'predicate',
              options: [
                { title: 'AND', key: 'AND' },
                { title: 'OR', key: 'OR' },
              ],
              default: 'AND',
            },
            booleanOptions: {
              type: 'checkbox',
              title: 'Case insensitive',
              options: { caseInsensitive: 'Case insensitive' },
              default: ['caseInsensitive'],
            },
          },
        },
        aliases: {
          options: {
            type: 'table',
            multiple: true,
            title: 'Aliases',
          },
          fields: {
            alias: {
              type: 'text',
              title: 'Path alias',
            },
            pattern: {
              type: 'text',
              title: 'Path or regexp',
            },
          },
        },
        ignorePaths: {
          options: {
            type: 'table',
            multiple: true,
            title: 'Paths to ignore',
          },
          fields: {
            path: {
              type: 'text',
              title: 'ignored path',
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
    predicate: ['groups', 'group', 0, 'predicate', 0],
    booleanOptions: ['groups', 'group', 0, 'booleanOptions', 0],
    aliases: ['groups', 'aliases', 0],
    ignorePaths: ['groups', 'ignorePaths', 0],
  };

  Controller.prototype.onQuery = function(query) {
    if (!this.module.view._data) return;
    const pathAlias = this.module
      .getConfiguration('aliases', [])
      .reduce((prev, current) => {
        if (!current.alias || !current.pattern) {
          return prev;
        }
        const pattern = convertStrToRegexp(current.pattern);
        prev[current.alias] = pattern;
        return prev;
      }, {});
    const ignorePaths = this.module
      .getConfiguration('ignorePaths', [])
      .map((el) => el.path)
      .filter((el) => el)
      .map(convertStrToRegexp);
    const options = {
      pathAlias,
      caseInsensitive: this.module.getConfigurationCheckbox(
        'booleanOptions',
        'caseInsensitive',
      ),
      predicate: this.module.getConfiguration('predicate', 'AND'),
      keywords: query,
      index: true,
      limit: this.module.getConfiguration('limit', 0),
      ignorePaths,
    };
    var array = DataObject.resurrect(this.module.view._data);
    var result = filter(array, options);
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
