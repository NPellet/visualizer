'use strict';

define(['modules/default/defaultview', 'src/util/util', 'fancytree'], function (Default, Util) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {
    init: function () {
      var id = Util.getNextUniqueId();
      this.dom = $(`<table id="${id}">`).css({
        width: '100%'
      });

      var columns = this.module.getConfiguration('columns') || [],
        colgroup = $('<colgroup><col></col></colgroup>').appendTo(this.dom),
        thead = $('<tr><th></th></tr>').appendTo($('<thead></thead>').appendTo(this.dom)),
        trow = $('<tr><td></td></tr>').appendTo($('<tbody></tbody>').appendTo(this.dom)),
        jpaths = [];
      this.jpathsF = {};

      if (columns.length) {
        var col;
        for (var i = 0; i < columns.length; i++) {
          col = columns[i];
          if (col.jpath) {
            colgroup.append($(`<col${col.width ? ` width="${col.width}px"` : ''}></col>`));
            thead.append(`<th>${col.name || ''}</th>`);
            trow.append('<td></td>');
            jpaths.push(col.jpath);
            Util.addjPathFunction(this.jpathsF, col.jpath);
          }
        }
      }

      this.expand = this.module.getConfiguration('expand');

      this.jpaths = jpaths;

      this.module.getDomContent().html(this.dom);
    },
    inDom: function () {
      var that = this;

      this.dom.fancytree({
        extensions: ['table'],
        table: {
          indentation: 20,
          nodeColumnIdx: 0
        },
        icon: false,
        renderColumns: function (event, data) {
          var node = data.node,
            dataObj = node.data.dataObj,
            $tdList = $(node.tr).find('>td'),
            jpaths = that.jpaths;
          if (dataObj.info) {
            for (var i = 0; i < jpaths.length; i++) {
              $tdList.eq(i + 1).text(that.jpathsF[jpaths[i]](dataObj.info));
            }
          }
        },
        activate: function (event, data) {
          that.module.controller.onActivate(data.node.data.dataObj);
        }
      });

      this.tree = this.dom.fancytree('getTree');

      this.resolveReady();
    },

    update: {
      tree: function (value) {
        var result = treeToFancy(value.get());
        this.module.model._objectModel = result.model;
        this.tree.reload(result.fancy);
        if (this.expand === 'lvl1') {
          var firstlvl = this.tree.rootNode.children;
          for (var i = 0; i < firstlvl.length; i++) {
            firstlvl[i].setExpanded(true);
          }
        } else if (this.expand === 'all') {
          this.tree.visit(function (node) {
            node.setExpanded(true);
          });
        }
      }
    },
    blank: {
      tree: function () {
        this.tree.reload();
      }
    }
  });

  function treeToFancy(tree) {
    var fancyTree = [];
    if (tree.children && tree.children.length) {
      var objectModel = new DataObject();
      addFancyChildren(fancyTree, tree.children, objectModel);
    }
    return {
      fancy: fancyTree,
      model: objectModel
    };
  }

  function addFancyChildren(fancyTree, children, objectModel) {
    var child, fancyChild,
      i = 0,
      l = children.length;
    for (; i < l; i++) {
      child = children[i];

      if (i === 0) {
        // add current object's properties to the model
        if (typeof child.info === 'object') {
          var keys = Object.keys(child.info),
            key;
          for (var j = 0; j < keys.length; j++) {
            key = keys[j];
            if (!objectModel.hasOwnProperty(key)) {
              objectModel[key] = child.info[key];
            }
          }
        }
      }

      fancyChild = {
        title: child.label || 'Untitled node',
        dataObj: DataObject.check(child)
      };
      fancyTree.push(fancyChild);
      if (child.children && child.children.length) {
        fancyChild.children = [];
        addFancyChildren(fancyChild.children, child.children, objectModel);
      }
    }
  }

  return View;
});
