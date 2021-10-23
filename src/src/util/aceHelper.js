'use strict';

define(function () {
  const aceHelper = {};

  aceHelper.getConfig = function () {
    return {
      options: {
        type: 'list',
        title: 'Ace editor options'
      },
      fields: {
        useSoftTabs: {
          type: 'checkbox',
          title: 'Use soft tabs',
          options: {
            yes: 'yes'
          },
          default: ['yes']
        },
        tabSize: {
          type: 'float',
          title: 'Tab size',
          default: 4
        }
      }
    };
  };

  aceHelper.getAliases = function (name) {
    return {
      useSoftTabs: ['groups', name, 0, 'useSoftTabs', 0],
      tabSize: ['groups', name, 0, 'tabSize', 0]
    };
  };

  aceHelper.applyConfig = function (module, editor) {
    var session = editor.getSession();
    session.setOptions({
      useSoftTabs: module.getConfigurationCheckbox('useSoftTabs', 'yes'),
      tabSize: module.getConfiguration('tabSize')
    });
  };

  return aceHelper;
});
