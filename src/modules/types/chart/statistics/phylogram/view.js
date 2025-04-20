'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'lib/d3/d3.phylogram',
  'src/util/api',
  'src/util/ui',
  'src/util/tree',
], function (Default, Util, d3, API, ui, Tree) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      this._id = Util.getNextUniqueId();
      this.selectorId = `#${this._id}`;
      this.chart = null;
      this.currentHighlightId = null;

      this.dom = ui.getSafeElement('div').attr('id', this._id);
      this.module.getDomContent().html(this.dom);
      this.resolveReady();
    },
    blank() {
      this.dom.empty();
    },
    getIdHash(currentNode) {
      if (currentNode.id) {
        this._idHash[currentNode.id] = currentNode;
      }
      if (Array.isArray(currentNode.children)) {
        for (var i = 0; i < currentNode.children.length; i++) {
          this.getIdHash(currentNode.children[i]);
        }
      }
    },
    update: {
      tree(data) {
        this._value = data.get();
        this.updateTree();
      },

      newTree(moduleValue) {
        this._tree = moduleValue.get();
        this.doAnnotation();
      },

      data(data) {
        this._data = data.get();
        this.doAnnotation();
      },
    },

    doAnnotation() {
      if (this._tree) {
        var options = this.getOptions();
        this._value = Tree.annotateTree(this._tree, this._data || [], options);
        this.updateTree();
      }
    },

    updateTree() {
      this._idHash = [];
      this.getIdHash(this._value);

      API.killHighlight(this._id);

      this.drawPhylogram();
    },

    getOptions() {
      var options = {};
      var getConf = this.module.getConfiguration;
      maybePutOption(options, '$color', getConf('jpathColor'));
      maybePutOption(options, 'label', getConf('jpathLabel'));
      return options;
    },

    drawPhylogram(data, view) {
      if (!this._value) return;

      var dataD = this._value;
      var that = this;

      this.dom.empty();
      var skipBranchLengthScaling = this.module.getConfigurationCheckbox(
        'd3check',
        'skipBranchLengthScaling',
      );
      d3.phylogram.build(this.selectorId, dataD, {
        height: that.height,
        width: that.width,
        skipBranchLengthScaling,
        skipTicks: false,
        skipLabels: this.module.getConfigurationCheckbox(
          'd3check',
          'skipLabels',
        ),
        skipNodeLabels: this.module.getConfigurationCheckbox(
          'd3check',
          'skipNodeLabels',
        ),
        labelDx: this.module.getConfiguration('labelDx'),
        labelDy: this.module.getConfiguration('labelDy'),
        labelSize: this.module.getConfiguration('labelSize'),
        nodeLabelSize: this.module.getConfiguration('nodeLabelSize'),
        children(node) {
          return node.children;
        },
        // LEAF
        callbackMouseOverLeaf(data) {
          that.module.controller.mouseOverLeaf(data);
          API.highlight(data.data, 1);
        },
        callbackMouseOutLeaf(data) {
          that.module.controller.mouseOutLeaf(data);
          API.highlight(data.data, 0);
        },
        callbackClickLeaf(data) {
          that.module.controller.clickLeaf(data);
        },
        // BRANCH
        callbackMouseOverBranch(data) {
          that.module.controller.mouseOverBranch(data.target);
        },
        callbackMouseOutBranch(data) {
          that.module.controller.mouseOutBranch(data.target);
        },
        callbackClickBranch(data) {
          that.module.controller.clickBranch(data.target);
        },
      });

      var leaves = d3.selectAll(`${this.selectorId} .leaf`);

      leaves.each(function (data) {
        (function (dataNode, leaf) {
          if (dataNode.data && dataNode.data._highlight) {
            API.listenHighlight(
              dataNode.data,
              function (value, what) {
                var point = leaf.select('circle');
                point.attr('fill', function (a) {
                  if (a.data && a.data.$color) return a.data.$color;
                  if (value) return '#f5f48d';
                  return 'grey';
                });
                point.attr('r', value ? 9 : 4.5);
              },
              false,
              that._id,
            );
          }
        })(data, d3.select(this));
      });

      // ( this.module.getConfiguration('defaultvalue') || '' )
      d3.selectAll(`${this.selectorId} .link`).each(function () {
        // d3.select(this).attr('stroke',( view.module.getConfiguration('branchColor') || '#cccccc' ));
        const branchWidth = that.module.getConfiguration('branchWidth') || '5';
        d3.select(this).attr('stroke-width', `${branchWidth}px`);
      });
    },
    onResize() {
      this.drawPhylogram();
    },
  });

  return View;

  function maybePutOption(options, name, value) {
    if (Array.isArray(value)) {
      options[name] = value;
    }
  }
});
