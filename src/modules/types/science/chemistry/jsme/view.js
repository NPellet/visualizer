'use strict';

define([
  'require',
  'modules/default/defaultview',
  'src/util/api',
  'src/util/ui',
  'src/util/debug',
  'openchemlib',
], function (require, Default, API, ui, Debug, OCL) {
  function View() {}

  var views = {};

  window.addEventListener('message', function (event) {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }
    if (message.module !== 'jsme') {
      return;
    }
    var id = message.id;
    if (!views[id]) {
      Debug.error(`No view with ID ${id}`);
      return;
    }
    var view = views[id];
    switch (message.type) {
      case 'ready':
        view.resolveReady();
        break;
      case 'onChange':
        view.module.controller.onChange(message.message);
        break;
      case 'doHighlight':
        view._doHighlight(message.message.mol, message.message.atom);
        break;
      case 'atomHover':
        view.module.controller.onAtomHover(message.message);
        break;
      case 'atomClicked':
        view.module.controller.onAtomClick(message.message);
        break;
      case 'bondHover':
        view.module.controller.onBondHover(message.message);
        break;
      case 'bondClicked':
        view.module.controller.onBondClick(message.message);
        break;
      default:
        Debug.error('Message type not handled: ', message.type);
        break;
    }
  });

  $.extend(true, View.prototype, Default, {
    init() {
      var that = this;

      var id = this.module.getId();
      views[id] = this;

      this.dom = ui.getSafeElement('iframe').attr({
        allowfullscreen: true,
        src: require.toUrl('./jsme.html'),
      });

      this.module.getDomContent().html(this.dom);
      this.module.getDomContent().css('overflow', 'hidden');

      this.dom.bind('load', function () {
        that.postMessage('init', {
          prefs: that.getPrefs(),
          highlightColor: that.getHighlightColor(),
          bondwidth: that.module.getConfiguration('bondwidth'),
          labelsize: that.module.getConfiguration('labelsize'),
          defaultaction: that.module.getConfiguration('defaultaction'),
          id,
        });
      });
    },

    setJSMEOptions(options) {
      options = {
        ...options,
        prefs: options.prefs ? options.prefs.map(String).join(',') : undefined,
      };
      this.postMessage('setOptions', options);
    },

    getPrefs() {
      return this.module.getConfiguration('prefs').join(',');
    },

    getHighlightColor() {
      return this.module.getConfiguration('highlightColor', '3');
    },

    onResize() {
      this.dom.attr('width', this.width);
      this.dom.attr('height', this.height);

      this.postMessage('setSize', {
        width: this.width,
        height: this.height,
      });

      this.refresh();
    },

    onProgress() {
      this.dom.html('Progress. Please wait...');
    },

    blank: {
      mol() {
        this._currentValue = null;
        this._currentType = null;
        this.postMessage('clear', '*');
      },
      jme() {
        this._currentValue = null;
        this._currentType = null;
        this.postMessage('clear', '*');
      },
      smiles() {
        this._currentValue = null;
        this._currentType = null;
        this.postMessage('clear', '*');
      },
    },

    update: {
      mol(moduleValue) {
        this._currentValue = moduleValue;
        this._currentType = 'mol';
        if (!moduleValue.get()) return;

        let molfile = String(moduleValue.get());
        if (molfile.includes('V3000')) {
          let that = this;
          let mol = OCL.Molecule.fromMolfile(molfile);
          that.postMessage('setMolFile', mol.toMolfile());
          that._initHighlight(moduleValue);
        } else {
          this.postMessage('setMolFile', molfile);
          this._initHighlight(moduleValue);
        }
      },
      jme(moduleValue) {
        this._currentValue = moduleValue;
        this._currentType = 'jme';
        if (!moduleValue.get()) return;

        this.postMessage('setJmeFile', String(moduleValue.get()));
        this._initHighlight(moduleValue);
      },
      smiles(moduleValue) {
        var that = this;
        this._currentValue = moduleValue;
        this._currentType = 'smiles';

        require(['openchemlib'], function (OCL) {
          var smiles = String(moduleValue.get());
          var mol = OCL.Molecule.fromSmiles(smiles);
          that.postMessage('setMolFile', mol.toMolfile());
          that._initHighlight(moduleValue);
        });
      },
    },

    onActionReceive: {
      setOptions(val) {
        this.setJSMEOptions(val);
      },
    },

    _initHighlight(moduleValue) {
      var that = this;
      API.killHighlight(this.module.getId());
      API.listenHighlight(
        moduleValue,
        function (onOff, highlightId) {
          var atoms = [];
          for (var i = 0, l = highlightId.length; i < l; i++) {
            if (!Array.isArray(moduleValue._atoms[highlightId[i]])) {
              moduleValue._atoms[highlightId[i]] = [
                moduleValue._atoms[highlightId[i]],
              ];
            }
            atoms = atoms.concat(moduleValue._atoms[highlightId[i]]);
          }
          that.postMessage('setHighlight', {
            atoms,
            onOff,
          });
        },
        false,
        this.module.getId(),
      );
    },

    _doHighlight(mol, id) {
      if (!this._currentValue) return;

      // there is a problem with overlapping atoms, there is no event out
      // we therefore systematically unhighlight
      for (const i in this._currentValue._atoms) {
        if (this._currentValue._atoms[i].includes(this.highlightedAtom)) {
          API.highlightId(i, false);
        }
      }

      for (const i in this._currentValue._atoms) {
        if (id != 0 && this._currentValue._atoms[i].includes(id - 1)) {
          API.highlightId(i, 1);
        }
      }

      this.highlightedAtom = id - 1;
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
  });

  return View;
});
