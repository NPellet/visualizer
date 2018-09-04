'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Hierarchical structure',
    description: 'Displays a hierarchical structure',
    author: 'Michaël Zasso',
    date: '02.06.2014',
    license: 'MIT',
    cssClass: 'fancytree'
  };

  Controller.prototype.references = {
    tree: {
      label: 'Hierarchical structure (tree)'
    },
    nodeData: {
      label: 'Node data (info property on node)'
    },
    node: {
      label: 'Node'
    }
  };

  Controller.prototype.variablesIn = ['tree'];

  Controller.prototype.events = {
    onActivate: {
      label: 'Select a node',
      refVariable: ['nodeData', 'node']
    },
    onActivateLeaf: {
      label: 'Select a leaf',
      refVariable: ['nodeData', 'node']
    },
    onActivateParent: {
      label: 'Select a parent',
      refVariable: ['nodeData', 'node']
    }
  };

  Controller.prototype.configurationStructure = function () {
    var jpaths = this.module.model.getjPath('nodeData');

    return {
      groups: {
        group: {
          options: {
            type: 'list',
            multiple: false
          },
          fields: {
            expand: {
              type: 'combo',
              title: 'Auto-expand children',
              default: 'none',
              options: [
                {
                  title: 'None',
                  key: 'none'
                },
                {
                  title: 'First level',
                  key: 'lvl1'
                },
                {
                  title: 'All nodes',
                  key: 'all'
                }
              ]
            }
          }
        },
        cols: {
          options: {
            type: 'table',
            multiple: true,
            title: 'Columns'
          },

          fields: {

            name: {
              type: 'text',
              title: 'Columns title'
            },

            jpath: {
              type: 'combo',
              title: 'jPath',
              options: jpaths
            },

            width: {
              type: 'text',
              title: 'Width'
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    columns: ['groups', 'cols', 0],
    expand: ['groups', 'group', 0, 'expand', 0]
  };

  Controller.prototype.onActivate = function (data) {
    this.createDataFromEvent('onActivate', 'nodeData', data.info);
    this.createDataFromEvent('onActivate', 'node', data);

    if (data.children && data.children.length) {
      this.createDataFromEvent('onActivateParent', 'nodeData', data.info);
      this.createDataFromEvent('onActivateParent', 'node', data);
    } else {
      this.createDataFromEvent('onActivateLeaf', 'nodeData', data.info);
      this.createDataFromEvent('onActivateLeaf', 'node', data.info);
    }
  };

  return Controller;
});
