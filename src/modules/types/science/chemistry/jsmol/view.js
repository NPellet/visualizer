'use strict';

define([
  'require',
  'lodash',
  'modules/default/defaultview',
  'src/util/api',
  'src/util/debug',
], function (require, _, Default, API, Debug) {
  function View() {}

  var views = {};

  window.addEventListener('message', function (event) {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }
    if (message.module !== 'jsmol') {
      return;
    }
    var id = message.id;
    if (!views[id]) {
      Debug.error(`No view with ID ${id}`);
      return;
    }
    var view = views[id];
    var atom;
    switch (message.type) {
      case 'ready':
        view.resolveReady();
        break;
      case 'message':
        view.module.controller.onNewMessage(message.message);
        break;
      case 'atomClick':
        atom = view.parseAtom(message.message);
        view.module.controller.onAtomClick(atom);
        break;
      case 'atomHover':
        atom = view.parseAtom(message.message);
        view._doHighlights(atom);
        view.module.controller.onAtomHover(atom);
        break;
      case 'error':
        Debug.warn('An error message was received', message.message);
        break;
      case 'execSync':
        view.module.controller.onSyncExecDone(message.message);
        break;
      default:
        Debug.error('Message type not handled: ', message.type);
        break;
    }
  });

  $.extend(true, View.prototype, Default, {
    init() {
      var that = this;
      this.actionOnloadScript = '';
      var id = this.module.getId();
      views[id] = this;
      let webgl = (this.module.getConfiguration('prefs') || []).includes(
        'webgl',
      );

      this.dom = $('<iframe>', {
        src: require.toUrl(`./jsmol.html?webgl=${webgl}`),
      }).css({
        border: 0,
        height: '100%',
        width: '100%',
      });
      this.module.getDomContent().html(this.dom).css({
        overflow: 'hidden',
        height: '100%',
        width: '100%',
        display: 'block',
      });

      this._highlights = this._highlights || [];

      this.dom.bind('load', function () {
        that.postMessage('init', {
          id,
        });
      });
    },

    onResize() {
      /*
            this.dom.height(this.height).width(this.width);
            console.log('resize', this.height, this.width);
            this.postMessage('setSize', {
                width: this.width,
                height: this.height
            });
            */
    },

    inDom() {
      var that = this;
      this.dom.parent().on('mouseleave', function () {
        if (that.lastHoveredAtom) {
          API.highlightId(that.lastHoveredAtom.label, 0);
          that.lastHoveredAtom = null;
        }
      });
    },

    blank: {
      data() {
        if (
          (
            (this.module.data && this.module.getConfiguration('prefs')) ||
            []
          ).includes('orientation')
        ) {
          this.storeOrientation();
        }
        this.postMessage('blank', '');
      },
    },

    update: {
      data(data) {
        var that = this;
        this.module.data = data;
        that.postMessage('setMolFile', {
          _modelLoad: data.get(),
          _lattice: data._lattice,
          _script: data._script,
        });

        if (that.module.getConfiguration('script')) {
          that.postMessage('executeScript', [
            that.module.getConfiguration('script'),
          ]);
        }
        if (that.actionOnloadScript) {
          that.postMessage('executeScript', [that.actionOnloadScript]);
        }
        if (that.module.getConfiguration('syncScript')) {
          that.postMessage('executeScriptSync', [
            that.module.getConfiguration('syncScript'),
          ]);
        }

        this._activateHighlights();

        // self.postMessage('restoreOrientation', 'lastOrientation');
      },
    },

    onActionReceive: {
      jsmolscript(a) {
        this.executeScript(a);
      },
      jsmolscriptSync(a) {
        this.executeScriptSync(a);
      },
      setTempJsmolScript(value) {
        this.actionOnloadScript = value;
      },
    },

    executeScriptSync(src) {
      this.postMessage('executeScriptSync', [src]);
    },

    executeScript(src) {
      this.postMessage('executeScript', [src]);
    },

    postMessage(type, message) {
      var cw = this.dom.get(0).contentWindow;
      if (cw) {
        cw.postMessage(
          JSON.stringify({
            type,
            message,
          }),
          '*',
        );
      }
    },

    remove(id) {
      delete views[id];
    },

    parseAtom(atom) {
      var reg =
        /^([^\s]+)\s+([^\s]+)\s+([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)/;
      var m = reg.exec(atom);
      return {
        id: m[2],
        label: m[1],
        x: m[3],
        y: m[4],
        z: m[5],
      };
    },

    storeOrientation() {
      this.postMessage('saveOrientation', []);
    },

    _doHighlights(atom) {
      if (this.lastHoveredAtom) {
        if (this.lastHoveredAtom.label === atom.label) {
          this._undoHighlightsDebounced();
          return;
        }
        API.highlightId(this.lastHoveredAtom.label, 0);
      }
      this._undoHighlights();
      API.highlightId(atom.label, 1);
      this.lastHoveredAtom = atom;
      this._undoHighlightsDebounced();
    },

    _undoHighlights() {
      _undoHighlights.call(this);
    },

    _undoHighlightsDebounced() {
      _undoHighlightsDebounced.call(this);
    },

    _activateHighlights() {
      var that = this;
      if (!this.module.data._highlight) return;
      if (!this.module.data._atoms) {
        // eslint-disable-next-line no-console
        console.log(
          'JSmol highlight module requires an object _atoms with list of atoms to hightlight',
        );
        return;
      }
      var highlight = _(this.module.data._highlight).flatten().uniq().value();

      that._highlighted = [];

      API.killHighlight(this.module.getId());
      for (let i = 0; i < highlight.length; i++) {
        API.listenHighlight(
          { _highlight: highlight[i] },
          function (onOff, key) {
            if (Array.isArray(key)) {
              key = [key];
            }
            if (onOff) {
              that._highlighted = _(that._highlighted)
                .push(key)
                .flatten()
                .uniq()
                .value();
            } else {
              that._highlighted = [];
            }
            _HighlightsDebounced(that);
          },
          false,
          that.module.getId(),
        );
      }
    },
  });

  function _drawHighlight(target) {
    if (target._highlighted && target._highlighted.length > 0) {
      let script = 'selectionHalos on;';
      const toHighlight = target._highlighted.flat();
      const atoms = toHighlight
        .flatMap((id) => target.module.data._atoms[id])
        .map((id) => id + 1);

      script += `select atomno=[${atoms.join(',')}];`;
      target.executeScript(script);
    } else {
      target.executeScript('selectionHalos off;');
    }
  }

  function _undoHighlights() {
    if (this.lastHoveredAtom) {
      API.highlightId(this.lastHoveredAtom.label, 0);
      this.lastHoveredAtom = null;
    }
  }

  var _undoHighlightsDebounced = _.debounce(_undoHighlights, 250);

  const _HighlightsDebounced = _.debounce((that) => _drawHighlight(that), 100);

  return View;
});
