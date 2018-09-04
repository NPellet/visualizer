'use strict';

define([
  'jquery',
  'modules/default/defaultcontroller',
  'src/util/datatraversing',
  'src/util/util'
], function ($, Default, Traversing, Util) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Circular dendrogram',
    description: 'Display a dendrogram based on jit',
    author: 'Luc Patiny',
    date: '30.12.2013',
    license: 'MIT',
    cssClass: 'dendrogram'
  };

  Controller.prototype.events = {
    onHover: {
      label: 'Hover a node',
      refVariable: ['node']
    },
    onClick: {
      label: 'Click a node',
      refVariable: ['node']
    }
  };

  Controller.prototype.onHover = function (element) {
    if (!element) {
      return;
    }
    this.createDataFromEvent('onHover', 'node', element);
  };

  Controller.prototype.onClick = function (element) {
    if (!element) {
      return;
    }
    this.createDataFromEvent('onClick', 'node', element);
  };

  Controller.prototype.references = {
    tree: {
      type: ['tree', 'object'],
      label: 'A Hierarchical tree'
    },
    newTree: {
      type: ['tree', 'object'],
      label: 'Annotated tree'
    },
    data: {
      type: ['array'],
      label: 'Annotation data'
    },
    node: {
      label: 'Node'
    }
  };

  Controller.prototype.variablesIn = ['tree', 'newTree', 'data'];

  Controller.prototype.configurationStructure = function () {
    var dataJPath = [];
    var data = this.module.getDataFromRel('data');
    if (data) {
      Traversing.getJPathsFromElement(data[0], dataJPath);
    }

    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            jpathShape: {
              type: 'combo',
              title: 'Shape jpath',
              options: dataJPath,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            nodeType: {
              type: 'combo',
              title: 'Node Type',
              default: 'circle',
              options: [
                { title: 'Circle', key: 'circle' },
                { title: 'Triangle', key: 'triangle' },
                { title: 'Square', key: 'squqre' },
                { title: 'Star', key: 'star' },
                { title: 'Ellipse', key: 'ellipse' },
                { title: 'Rectangle', key: 'rectangle' },
                { title: 'Image', key: 'image' },
                { title: 'Pie chart', key: 'piechart' }
              ]
            },
            jpathSize: {
              type: 'combo',
              title: 'Size jpath',
              options: dataJPath,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            nodeSize: {
              type: 'text',
              title: 'Default node size'
            },
            jpathColor: {
              type: 'combo',
              title: 'Color jpath',
              options: dataJPath,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            nodeColor: {
              type: 'color',
              title: 'Default node color'
            },
            jpathLabel: {
              type: 'combo',
              title: 'Label jpath',
              options: dataJPath,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            labelSize: {
              type: 'text',
              title: 'Default label size'
            },
            labelColor: {
              type: 'color',
              title: 'Default label color'
            },
            edgeWidth: {
              type: 'text',
              title: 'Default edge width'
            },
            edgeColor: {
              type: 'color',
              title: 'Default edge color'
            },
            strokeWidth: {
              type: 'text',
              title: 'Background line width'
            },
            strokeColor: {
              type: 'color',
              title: 'Background line color'
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    nodeType: ['groups', 'group', 0, 'nodeType', 0],
    jpathShape: ['groups', 'group', 0, 'jpathShape', 0],
    nodeSize: ['groups', 'group', 0, 'nodeSize', 0],
    jpathSize: ['groups', 'group', 0, 'jpathSize', 0],
    nodeColor: ['groups', 'group', 0, 'nodeColor', 0],
    jpathColor: ['groups', 'group', 0, 'jpathColor', 0],
    labelSize: ['groups', 'group', 0, 'labelSize', 0],
    labelColor: ['groups', 'group', 0, 'labelColor', 0],
    edgeWidth: ['groups', 'group', 0, 'edgeWidth', 0],
    edgeColor: ['groups', 'group', 0, 'edgeColor', 0],
    strokeWidth: ['groups', 'group', 0, 'strokeWidth', 0],
    strokeColor: ['groups', 'group', 0, 'strokeColor', 0],
    jpathLabel: ['groups', 'group', 0, 'jpathLabel', 0],
  };

  return Controller;
});
