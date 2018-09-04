'use strict';

define(['modules/default/defaultcontroller', 'src/util/util'], function (Default, Util) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Sticky note',
    description: 'Displays a sticky note',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: 'postit',
    hidden: true
  };

  Controller.prototype.references = {
    value: {
      label: 'Sticky note value',
      type: 'string'
    }
  };

  Controller.prototype.events = {
    onChange: {
      label: 'Value is changed',
      refVariable: ['value']
    }
  };

  Controller.prototype.configurationStructure = function () {
    var standardFonts = Util.getWebsafeFonts();
    standardFonts.push({ title: 'Post-it', key: 'Post_IT' });
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            fontfamily: {
              type: 'combo',
              title: 'Font-family',
              default: 'Post_IT',
              options: standardFonts
            },

            editable: {
              type: 'checkbox',
              title: 'Is Editable',
              options: { isEditable: 'Yes' },
              default: ['isEditable']
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    fontfamily: ['groups', 'group', 0, 'fontfamily', 0],
    editable: ['groups', 'group', 0, 'editable', 0]
  };

  return Controller;
});
