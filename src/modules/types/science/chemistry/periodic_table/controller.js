'use strict';

define(['modules/default/defaultcontroller', 'lodash', 'src/util/util'], function (Default, _, Util) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Periodic table',
    description: 'Display the periodic table of elements',
    author: 'Daniel Kostro',
    date: '09.06.2015',
    license: 'MIT',
    cssClass: 'periodic-table'
  };

  Controller.prototype.references = {
    template: {
      label: 'template'
    },
    value: {
      label: 'Periodic table elements'
    },
    hltemplate: {
      label: 'Highlight template'
    },
    elements: {
      label: 'A selection of elements'
    },
    element: {
      label: 'An element'
    }
  };

  Controller.prototype.events = {
    onPeriodSelect: {
      label: 'Period selected',
      refVariable: ['elements']
    },
    onGroupSelect: {
      label: 'Group selected',
      refVariable: ['elements']
    },
    onElementsSelect: {
      label: 'Elements selected',
      refVariable: ['elements']
    },
    onElementSelect: {
      label: 'Element clicked',
      refVariable: ['element']
    },
    onElementHover: {
      label: 'Element hovered',
      refVariable: ['element']
    }
  };

  Controller.prototype.variablesIn = ['template', 'hltemplate', 'value'];

  Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
    select: 'Select element(s)',
    setSelected: 'Set selected element(s)'
  });

  Controller.prototype.configurationStructure = function () {
    var jpaths = this.module.model.getjPath();

    var background = {
      options: {
        type: 'list',
        title: 'Background'
      },
      fields: {
        mode: {
          type: 'combo',
          title: 'Mode',
          options: [
            { key: 'none', title: 'None' },
            { key: 'jpath', title: 'Based on color jpath' },
            { key: 'custom', title: 'Based on property' },
            { key: 'fixed', title: 'Fixed' }
          ],
          displaySource: { custom: 'c', jpath: 'j', fixed: 'f' },
          default: 'none'
        },
        jpath: {
          type: 'combo',
          title: 'jPath',
          options: jpaths,
          extractValue: Util.jpathToArray,
          insertValue: Util.jpathToString,
          displayTarget: ['c', 'j']
        },
        min: {
          type: 'float',
          displayTarget: ['c'],
          title: 'Min value'
        },
        max: {
          type: 'float',
          title: 'Max value',
          displayTarget: ['c']
        },
        val: {
          type: 'float',
          title: 'Default value',
          displayTarget: ['c']
        },
        step: {
          type: 'float',
          title: 'Step',
          displayTarget: ['c']
        },
        label: {
          type: 'text',
          title: 'Label',
          displayTarget: ['c'],
          default: ''
        },
        unit: {
          type: 'text',
          title: 'Unit',
          displayTarget: ['c'],
          default: ''
        },
        mincolor: {
          type: 'spectrum',
          title: 'Min color',
          displayTarget: ['c'],
          default: [0, 0, 255, 1]
        },
        neutralcolor: {
          type: 'spectrum',
          title: 'Neutral color',
          displayTarget: ['c'],
          default: [255, 255, 255, 1]
        },
        maxcolor: {
          type: 'spectrum',
          title: 'Max color',
          displayTarget: ['c'],
          default: [255, 0, 0, 1]
        },
        novaluecolor: {
          type: 'spectrum',
          title: 'No value color',
          displayTarget: ['c'],
          default: [90, 90, 90, 0.4]
        },
        fixedcolor: {
          type: 'spectrum',
          title: 'Fixed color',
          displayTarget: ['f'],
          default: [255, 255, 255, 1]
        },
        showslider: {
          type: 'checkbox',
          title: 'Show slider',
          options: {
            yes: 'Yes'
          },
          default: ['yes']
        }
      }
    };

    var foreground = _.cloneDeep(background);
    foreground.options.title = 'Foreground';
    foreground.fields.mode.options.push({
      key: 'state', title: 'State'
    });
    foreground.fields.fixedcolor.default = [0, 0, 0, 1];


    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            varName: {
              type: 'text',
              title: 'Variable name',
              displayTarget: ['elPref', 'elUrl'],
              default: ''
            },
            elementsSource: {
              type: 'combo',
              title: 'Elements source',
              options: [
                { key: 'varin', title: 'Variable in' },
                { key: 'pref', title: 'Preferences' },
                { key: 'url', title: 'Url' }
              ],
              displaySource: {
                url: 'elUrl',
                pref: 'elPref',
                varin: 'elVarin'
              },
              default: 'varin'
            },
            elementsUrl: {
              type: 'text',
              title: 'Elements url',
              default: '',
              displayTarget: ['elUrl']
            },
            elementsCode: {
              type: 'jscode',
              mode: 'text',
              title: 'Elements (JSON or csv)',
              default: '',
              displayTarget: ['elPref']
            },

            templateSource: {
              type: 'combo',
              title: 'Table template',
              options: [
                { key: 'varin', title: 'Variable in' },
                { key: 'pref', title: 'Preferences' }
              ],
              displaySource: { varin: 'v', pref: 'p' },
              default: 'pref'
            },
            template: {
              type: 'jscode',
              title: 'Table template',
              mode: 'html',
              displayTarget: ['p'],
              default: '<div class="element-data"><p class="Z">{{ element.Z }}</p><h2 class="element-name">{{ element.symbol }}</h2><p>{{ element.name }}</p></div>'
            },
            hltemplateSource: {
              type: 'combo',
              title: 'Highlight template',
              options: [
                { key: 'varin', title: 'Variable in' },
                { key: 'pref', title: 'Preferences' }
              ],
              displaySource: { varin: 'hv', pref: 'hp' },
              default: 'pref'
            },
            hltemplate: {
              type: 'jscode',
              title: 'Highlight template',
              mode: 'html',
              displayTarget: ['hp'],
              default: '<div class="element-data"><p class="Z">{{ element.Z }}</p><h2 class="element-name">{{ element.symbol }}</h2><p>{{ element.name }}</p></div>'
            },
            useHighlights: {
              type: 'checkbox',
              title: 'Use highlights',
              options: {
                yes: 'Yes'
              },
              default: ['yes']
            },
            display: {
              type: 'checkbox',
              title: 'Display options',
              options: {
                families: 'Show families'
              },
              default: ['families']
            }
          }
        },
        foreground,
        background
      }
    };
  };

  Controller.prototype.configAliases = {
    varName: ['groups', 'group', 0, 'varName', 0],
    elementsSource: ['groups', 'group', 0, 'elementsSource', 0],
    elementsUrl: ['groups', 'group', 0, 'elementsUrl', 0],
    elementsCode: ['groups', 'group', 0, 'elementsCode', 0],
    template: ['groups', 'group', 0, 'template', 0],
    templateSource: ['groups', 'group', 0, 'templateSource', 0],
    hltemplate: ['groups', 'group', 0, 'hltemplate', 0],
    hltemplateSource: ['groups', 'group', 0, 'hltemplateSource', 0],
    useHighlights: ['groups', 'group', 0, 'useHighlights', 0],
    foreground: ['groups', 'foreground', 0, 'mode', 0],
    background: ['groups', 'background', 0, 'mode', 0],
    foregroundStep: ['groups', 'foreground', 0, 'step', 0],
    backgroundStep: ['groups', 'background', 0, 'step', 0],
    display: ['groups', 'group', 0, 'display', 0]
  };

  ['Min', 'Max', 'Val', 'MinColor', 'MaxColor', 'NeutralColor', 'FixedColor', 'Label', 'Unit', 'Mode', 'Jpath', 'NoValueColor', 'ShowSlider'].forEach((val) => {
    Controller.prototype.configAliases[`foreground${val}`] = ['groups', 'foreground', 0, val.toLowerCase(), 0];
    Controller.prototype.configAliases[`background${val}`] = ['groups', 'background', 0, val.toLowerCase(), 0];
  });


  Controller.prototype.periodSelected = function (period) {
    var elements = this.module.view.elements;
    elements = elements.filter((el) => {
      return el.period == period;
    });

    this.createDataFromEvent('onPeriodSelect', 'elements', elements);
  };

  Controller.prototype.groupSelected = function (group) {
    var elements = this.module.view.elements;
    elements = elements.filter((el) => {
      return el.group == group;
    });

    this.createDataFromEvent('onGroupSelect', 'elements', elements);
  };

  Controller.prototype.elementSelected = function (atomicNumber) {
    atomicNumber = +atomicNumber;
    var elements = this.module.view.elements;
    var el = elements.find((el) => +DataObject.resurrect(el.Z) === atomicNumber);
    if (el) {
      this.createDataFromEvent('onElementSelect', 'element', el);
    }
  };

  Controller.prototype.elementHovered = function (atomicNumber) {
    atomicNumber = +atomicNumber;
    var elements = this.module.view.elements;
    var el = elements.find((el) => +DataObject.resurrect(el.Z) === atomicNumber);
    if (el) {
      this.createDataFromEvent('onElementHover', 'element', el);
    }
  };

  Controller.prototype.elementsSelected = function (atomicNumbers) {
    atomicNumbers = atomicNumbers.map((el) => +el);
    var elements = this.module.view.elements;
    elements = elements.filter((el) => {
      return atomicNumbers.indexOf(+DataObject.resurrect(el.Z)) > -1;
    });
    this.createDataFromEvent('onElementsSelect', 'elements', elements);
  };

  return Controller;
});
