'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'src/util/datatraversing',
  'src/util/api',
  'src/util/util',
  'src/util/ui',
  'lib/jit/jit-custom',
  'src/util/tree',
  'src/util/color'
], function ($, Default, Traversing, API, Util, ui, $jit, Tree, Color) {
  function View() {
    this._value = {};
  }

  $.extend(true, View.prototype, Default, {
    highlightNode(nodeID) {
      // TODO fix ?
      // node.setCanvasStyle('shadowBlur', 0, 'start');
      // node.setCanvasStyle('shadowBlur', 10, 'end');
      // this._rgraph.fx.animate({
      //    modes: ['node-style:shadowBlur'],
      //    duration: 200
      // });
    },

    init() {
      // When we change configuration the method init is called again. Also the case when we change completely of view
      if (!this.dom) {
        this._id = Util.getNextUniqueId();
        this.dom = ui.getSafeElement('div').attr('id', this._id);
        this.module.getDomContent().html(this.dom);
      }

      if (this.dom) {
        // in the dom exists and the preferences has been changed we need to clean the canvas
        this.dom.empty();
      }
      if (this._rgraph) {
        // if the dom existedd there was probably a rgraph or when changing of view
        delete this._rgraph;
      }
      this._highlighted = {};
      this.updateOptions();

      this.resolveReady();
    },

    onResize() {
      this.createDendrogram();
      this.updateDendrogram();
    },

    getIdHash(currentNode) {
      if (!currentNode) return;
      if (currentNode.id) {
        this._idHash[currentNode.id] = currentNode;
      }
      if (Array.isArray(currentNode.children)) {
        for (var i = 0; i < currentNode.children.length; i++) {
          this.getIdHash(currentNode.children[i]);
        }
      }
    },

    blank: {
      tree() {
        this._value = {};
        this.updateTree();
      },
      newTree() {
        this._tree = null;
        this._value = {};
        this.updateTree();
      },
      data() {
        this._data = null;
        this._value = {};
        this.updateTree();
      }
    },

    update: {
      tree(moduleValue) {
        this._value = $.extend(true, new DataObject({}), moduleValue.get());
        this.updateTree();
      },
      newTree(moduleValue) {
        this._tree = moduleValue.get();
        this.doAnnotation();
      },
      data(data) {
        this._data = data.get();
        this.doAnnotation();
      }
    },

    doAnnotation() {
      if (this._tree) {
        var options = this.getOptions();
        this._value = Tree.annotateTree(this._tree, this._data || [], options);
        this.updateTree();
      }
    },

    updateTree() {
      this._idHash = {};
      this.getIdHash(this._value);
      if (!this._rgraph) {
        if (!document.getElementById(this._id)) return; // this is the case when we change of view
        this.createDendrogram();
      }
      this.updateDendrogram();
    },

    getOptions() {
      var options = {};
      var getConf = this.module.getConfiguration;
      maybePutOption(options, '$color', getConf('jpathColor'));
      maybePutOption(options, '$dim', getConf('jpathSize'));
      maybePutOption(options, '$type', getConf('jpathShape'));
      maybePutOption(options, 'label', getConf('jpathLabel'));
      return options;
    },

    updateDendrogram() {
      if (!this._rgraph) return;

      this._rgraph.loadJSON(this._value);

      if (!this._value) return;

      // in each node we had the content of 'label'
      $jit.Graph.Util.each(this._rgraph.graph, (node) => {
        if (node.data && node.data.label) {
          node.name = node.data.label;
        } else {
          node.name = '';
        }
      });
      this._rgraph.refresh();
    },

    updateOptions() {
      var cfg = this.module.getConfiguration;

      this._options = {
        nodeSize: cfg('nodeSize') || 1,
        nodeColor: Color.getColor(cfg('nodeColor')) || 'yellow'
      };
    },

    createDendrogram() {
      var actions = this.module.vars_out();
      if (!actions || actions.length == 0) return;
      var hover = (node) => {
        this.module.controller.onHover(this._idHash[node.id]);
      };
      var click = (node) => {
        this.module.controller.onClick(this._idHash[node.id]);
      };

      var cfg = this.module.getConfiguration;

      this.dom.empty();

      var options = this._options;
      this._rgraph = new $jit.RGraph({
        injectInto: this._id,
        // withLabels: true,
        levelDistance: 50,
        // Optional: create a background canvas that plots
        // concentric circles.
        background: {
          CanvasStyles: {
            strokeStyle: Color.getColor(cfg('strokeColor')) || '#333',
            lineWidth: cfg('strokeWidth') || '1'
          }
        },

        // Add navigation capabilities:
        // zooming by scrolling and panning.
        Navigation: {
          enable: true,
          panning: true,
          zooming: 50
        },
        // Set Node and Edge styles.

        Edge: {
          overridable: true,
          color: Color.getColor(cfg('edgeColor')) || 'green',
          lineWidth: cfg('edgeWidth') || 0.5
        },
        Label: {
          overridable: true,
          type: 'Native', // 'SVG', 'Native', 'HTML'
          size: cfg('labelSize') || 10,
          family: 'sans-serif',
          textAlign: 'center',
          textBaseline: 'alphabetic',
          color: Color.getColor(cfg('labelColor')) || 'black'
        },

        Node: {
          CanvasStyles: {
            // we need to specify it here so that we can change it later (mouse enter, leave or external highlight)
            shadowColor: 'rgb(0, 0, 0)',
            shadowBlur: 0
          },

          overridable: true,
          type: cfg('nodeType') || 'circle',
          color: Color.getColor(cfg('nodeColor')) || 'yellow',
          dim: cfg('nodeSize') || 3,
          height: 3,
          width: 3,
          lineWidth: 10
        },

        Events: {
          getRgraph(e) {
            var src = e.srcElement.id.replace(/-.*/, '');
            if ($jit.existingInstance[src]) return $jit.existingInstance[src];
            // maybe we clicked on a label
            src = e.srcElement.parentElement.id.replace(/-.*/, '');
            if ($jit.existingInstance[src]) return $jit.existingInstance[src];
          },
          enable: true,
          enableForEdges: true,
          type: 'Native', // otherwise the events are only on the labels (if auto)
          onClick(node, eventInfo, e) {
            if (!node) return;
            var rgraph = this.getRgraph(e);

            var currentNode;
            // the problem is that the event may be taken by a hidden node ...
            if (node.collapsed) {
              // we click on a collapsed node
              currentNode = node;
            } else if (node.ignore) {
              // hidden node ?
              // in this case we should check the first node that is not hidden and expand it
              currentNode = node.getParents()[0];
              while (currentNode.ignore) {
                currentNode = currentNode.getParents()[0];
              }
            } else if (node.nodeFrom) {
              // click on an edge
              // we should always take the higher depth
              currentNode =
                node.nodeFrom._depth > node.nodeTo._depth
                  ? node.nodeFrom
                  : node.nodeTo;
              if (node.nodeFrom.collapsed) {
                currentNode = node.nodeFrom;
              }
              if (node.nodeTo.collapsed) {
                currentNode = node.nodeTo;
              }
            }
            if (currentNode) {
              // is there one collapsed node ? We expand it
              if (currentNode.collapsed) {
                rgraph.op.expand(currentNode, {
                  type: 'animate',
                  duration: 500,
                  hideLabels: false,
                  transition: $jit.Trans.Quart.easeInOut
                });
              } else {
                rgraph.op.contract(node.nodeFrom, {
                  type: 'animate',
                  duration: 500,
                  hideLabels: true,
                  transition: $jit.Trans.Quart.easeInOut
                });
              }
            } else {
              // click on a node
              if (!node.ignore) {
                // hidden node ?
                // rgraph.onClick(node.id);
                click(node);
              }
            }
          },
          onMouseEnter(node, eventInfo, e) {
            hover(node);
            this.getRgraph(e).canvas.getElement().style.cursor = 'pointer';
          },
          onMouseLeave(node, eventInfo, e) {
            this.getRgraph(e).canvas.getElement().style.cursor = '';
          }
        },
        Tips: {
          enable: false
        }
      });

      // we store in a cache to have access to the rgraph from an ID
      $jit.existingInstance = $jit.existingInstance || {};
      $jit.existingInstance[this._id] = this._rgraph;
    },

    _doHighlight(id, val) {
      if (this._highlighted[id] && val) return;
      if (!this._highlighted[id] && !val) return;
      this._highlighted[id] = val;
      for (var i in this._currentValue._atoms) {
        if (this._currentValue._atoms[i].indexOf(id) > -1) {
          API.highlight(i, val);
        }
      }
    }
  });

  return View;

  function maybePutOption(options, name, value) {
    if (Array.isArray(value)) {
      options[name] = value;
    }
  }
});
