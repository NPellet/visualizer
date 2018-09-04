'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'SVG Editor',
    description: 'SVG Editor',
    author: 'Daniel Kostro',
    date: '20.05.2014',
    license: 'MIT'
  };

  Controller.prototype.references = {
    svgString: {
      type: ['svg', 'string'],
      label: 'Svg string'
    },
    svgInput: {
      label: 'Svg input',
      type: 'string'
    },
    svgModifier: {
      label: 'An object describing svg modification'
    },
    info: {
      label: 'An info object'
    }
  };

  Controller.prototype.events = {
    onChange: {
      label: 'The svg content changed',
      refVariable: ['svgString']
    },
    onHover: {
      label: 'An svg element is hovered',
      refVariable: ['info']
    },
    onClick: {
      label: 'An svg element is clicked',
      refVariable: ['info']
    }
  };

  Controller.prototype.onChange = function (val) {
    this.createDataFromEvent('onChange', 'svgString', DataObject.check({
      type: 'svg',
      value: val
    }, true));
  };

  Controller.prototype.onHover = function (val) {
    this.createDataFromEvent('onHover', 'info', val);
  };

  Controller.prototype.onClick = function (val) {
    this.createDataFromEvent('onClick', 'info', val);
  };

  Controller.prototype.variablesIn = ['svgModifier', 'svgInput'];

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            editable: {
              type: 'checkbox',
              title: 'Is Editable',
              options: { isEditable: 'Yes' },
              default: []
            },
            sanitize: {
              type: 'checkbox',
              title: 'Sanitize',
              options: { doSanitize: 'yes' },
              default: []
            },
            saveSvg: {
              type: 'checkbox',
              title: 'Save svg in module preferences',
              options: {
                yes: 'Yes'
              },
              default: ['yes']
            },
            svgcode: {
              type: 'jscode',
              mode: 'svg',
              title: 'SVG code'
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    svgcode: ['groups', 'group', 0, 'svgcode', 0],
    editable: ['groups', 'group', 0, 'editable', 0],
    sanitize: ['groups', 'group', 0, 'sanitize', 0],
    saveSvg: ['groups', 'group', 0, 'saveSvg', 0]
  };

  return Controller;
});
