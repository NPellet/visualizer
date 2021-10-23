'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Score plot',
    description: 'Display a score plot',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: 'loading_plot'
  };

  Controller.prototype.references = {
    // Input
    loading: {
      label: 'Loading variable',
      type: ['loading', 'object']
    },
    preferences: {
      label: 'Preferences',
      type: 'object'
    },
    // Output
    element: {
      label: 'Selected element',
      type: 'object'
    },
    // Mixed
    zoom: {
      label: 'Zoom',
      type: 'string'
    },
    center: {
      label: 'Coordinates of the center',
      type: 'array'
    },
    viewport: {
      label: 'Viewport',
      type: 'object'
    }
  };

  Controller.prototype.events = {
    onHover: {
      label: 'Hovers an element',
      refVariable: ['element']
    },
    onMove: {
      label: 'Move the map',
      refVariable: ['center', 'zoom', 'viewport']
    },
    onZoomChange: {
      label: 'Change the zoom',
      refVariable: ['center', 'zoom', 'viewport']
    },
    onViewPortChange: {
      label: 'Viewport has changed',
      refVariable: ['center', 'zoom', 'viewport']
    }
  };

  Controller.prototype.variablesIn = ['loading'];

  Controller.prototype.actionsIn = {
    addElement: 'Add an element'
  };

  Controller.prototype.configurationStructure = function () {
    var data = this.module.getDataFromRel('loading'),
      opts = [];
    if (data && data.value)
      for (var i = 0; i < data.value.series.length; i++)
        opts.push({
          title: data.value.series[i].label,
          key: data.value.series[i].category
        });
    return {
      groups: {
        general: {
          options: {
            type: 'list',
            multiple: false
          },
          fields: {
            navigation: {
              title: 'Navigation',
              type: 'checkbox',
              options: { navigation: 'Navigation only' }
            }
          }
        }
      },
      sections: {
        module_layers: {
          options: {
            multiple: true,
            title: 'Layers'
          },
          groups: {
            group: {
              options: {
                type: 'list'
              },
              fields: {
                el: {
                  type: 'combo',
                  title: 'Layer',
                  options: opts
                },
                type: {
                  type: 'combo',
                  title: 'Display as',
                  options: [
                    {
                      key: 'ellipse',
                      title: 'Ellipse / Circle'
                    },
                    { key: 'pie', title: 'Pie chart' },
                    { key: 'img', title: 'Image' }
                  ]
                },
                color: {
                  type: 'color',
                  title: 'Color (default)'
                },
                labels: {
                  type: 'checkbox',
                  title: 'Labels',
                  options: {
                    display_labels: 'Display',
                    forcefield: 'Activate force field',
                    blackstroke: 'Add a black stroke around label',
                    scalelabel: 'Scale label with zoom'
                  }
                },
                labelsize: {
                  type: 'text',
                  title: 'Label size'
                },
                labelzoomthreshold: {
                  type: 'text',
                  title: 'Zoom above which labels are displayed'
                },
                highlightmag: {
                  type: 'text',
                  title: 'Highlight magnification'
                },
                highlighteffect: {
                  type: 'checkbox',
                  title: 'Highlight effect',
                  options: {
                    stroke: 'Thick yellow stroke'
                  }
                }
              }
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    navigation: ['groups', 'general', 0, 'navigation'],
    layers: ['sections', 'module_layers']
  };

  Controller.prototype.hover = function (data) {
    this.createDataFromEvent('onHover', 'element', data);
  };

  Controller.prototype.onZoomChange = function (zoom) {
    this.createDataFromEvent('onZoomChange', 'zoom', zoom);
  };

  Controller.prototype.onMove = function (x, y) {
    this.createDataFromEvent('onMove', 'center', [x, y]);
  };

  Controller.prototype.onChangeViewport = function (vp) {
    this.createDataFromEvent('onChangeViewport', 'viewport', vp);
  };

  return Controller;
});
