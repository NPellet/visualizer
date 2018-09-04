'use strict';

define([
  'modules/default/defaultcontroller',
  'src/util/datatraversing',
  'src/util/util'
], function (Default, Traversing, Util) {
  function Controller() {
    this._data = new DataObject();
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Phylogram',
    description: 'Display phylogram using D3 library',
    author: 'Nathanaêl Khodl, Luc Patiny, Michaël Zasso',
    date: '30.12.2013',
    license: 'MIT',
    cssClass: 'phylogram'
  };

  Controller.prototype.mouseOverLeaf = function (data) {
    if (data.data) {
      this._data = DataObject.check(data.data);
      this.createDataFromEvent('onLeafHover', 'leaf', DataObject.check(this._data));
    }
  };

  Controller.prototype.mouseOutLeaf = function () {

  };

  Controller.prototype.clickLeaf = function (data) {
    if (data.data) {
      this._data = DataObject.check(data.data);
      this.createDataFromEvent('onLeafSelect', 'leaf', DataObject.check(this._data));
    }
  };

  Controller.prototype.mouseOverBranch = function (data) {
    this.sendTreeFromEvent(data, 'onBranchHover');
  };

  Controller.prototype.mouseOutBranch = function () {
  };

  Controller.prototype.clickBranch = function (data) {
    this.sendTreeFromEvent(data, 'onBranchSelect');
  };

  Controller.prototype.sendTreeFromEvent = function (data, name) {
    var element = new DataObject({ type: 'tree', value: data }, true);
    this.sendActionFromEvent(name, 'tree', element);
    this.createDataFromEvent(name, 'tree', element);
    this.createDataFromEvent(name, 'list', function () {
      var arr = [];
      treeToArray(arr, data);
      return DataArray(arr);
    });
  };

  function treeToArray(arr, tree) {
    if (tree.children) {
      for (var i = 0, ii = tree.children.length; i < ii; i++) {
        treeToArray(arr, tree.children[i]);
      }
    } else if (tree.data) {
      arr.push(tree.data);
    }
  }

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
            branchWidth: {
              type: 'text',
              default: 4,
              title: 'Branch width'
            },
            jpathColor: {
              type: 'combo',
              title: 'Color jpath',
              options: dataJPath,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            d3check: {
              type: 'checkbox',
              title: 'd3 options',
              options: {
                skipLabels: 'Skip labels',
                skipBranchLengthScaling: 'Skip branch scaling'
              },
              default: ['skipLabels', 'skipBranchLengthScaling']
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
              title: 'Label font size',
              default: '10px'
            },
            labelDx: {
              type: 'float',
              title: 'Label dx',
              default: -30
            },
            labelDy: {
              type: 'float',
              title: 'Label dy',
              default: 4
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    branchWidth: ['groups', 'group', 0, 'branchWidth', 0],
    jpathColor: ['groups', 'group', 0, 'jpathColor', 0],
    jpathLabel: ['groups', 'group', 0, 'jpathLabel', 0],
    d3check: ['groups', 'group', 0, 'd3check', 0],
    labelSize: ['groups', 'group', 0, 'labelSize', 0],
    labelDx: ['groups', 'group', 0, 'labelDx', 0],
    labelDy: ['groups', 'group', 0, 'labelDy', 0]
  };

  Controller.prototype.events = {
    onLeafSelect: {
      label: 'Select a leaf',
      refVariable: ['leaf']
    },
    onLeafHover: {
      label: 'Hovers a leaf',
      refVariable: ['leaf']
    },
    onBranchSelect: {
      label: 'Select a branch',
      refVariable: ['tree', 'list']
    },
    onBranchHover: {
      label: 'Hovers a branch',
      refVariable: ['tree', 'list']
    }
  };

  Controller.prototype.references = {
    tree: {
      type: ['tree', 'object'],
      label: 'A tree with children'
    },
    leaf: {
      label: 'Value of the leaf'
    },
    list: {
      type: 'array',
      label: 'A list of children'
    },
    newTree: {
      type: ['tree', 'object'],
      label: 'Annotated tree'
    },
    data: {
      type: ['array'],
      label: 'Annotation data'
    }
  };

  Controller.prototype.variablesIn = ['tree', 'newTree', 'data'];

  return Controller;
});
