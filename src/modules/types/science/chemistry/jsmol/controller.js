'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.getToolbar = function () {
    var base = Default.getToolbar.call(this);
    base.unshift({
      onClick: function () {
        window.open('http://wiki.jmol.org/index.php/Mouse_Manual', '_blank');
      },
      title: 'Help',
      cssClass: 'fa fa-question',
      ifLocked: true
    });
    return base;
  };

  Controller.prototype.moduleInformation = {
    name: 'JSMol',
    description: 'Display a JSMol module',
    author: 'Nathanaêl Khodl, Luc Patiny',
    date: '30.12.2013',
    license: 'MIT',
    cssClass: 'jsmol'
  };

  Controller.prototype.references = {
    data: {
      type: ['cif', 'pdb', 'mol3d', 'magres', 'mol2d', 'jme', 'string'],
      label: 'A molecule/protein data'
    },
    message: {
      type: ['string'],
      label: 'Messages from jsmol'
    },
    atom: {
      type: ['string'],
      label: 'A string describing the clicked atom'
    },
    execResult: {
      type: ['string'],
      label: 'Result of executing sync script'
    }
  };

  Controller.prototype.events = {
    onMessage: {
      label: 'A new message from jsmol arrived',
      refVariable: ['message']
    },
    onAtomClick: {
      label: 'An atom was clicked',
      refVariable: ['atom']
    },
    onAtomHover: {
      label: 'An atom was hovered',
      refVariable: ['atom']
    },
    onExecResult: {
      label: 'New sync exec result',
      refVariable: ['execResult']
    }
  };

  Controller.prototype.variablesIn = ['data'];

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },

          fields: {
            prefs: {
              type: 'checkbox',
              title: 'Options',
              default: [],
              options: {
                webgl: 'Enable webgl (fast but limited rendering options)'
              }
            },
            script: {
              type: 'jscode',
              title: 'After load script'
            },
            syncScript: {
              type: 'jscode',
              title: 'Sync after load script'
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    script: ['groups', 'group', 0, 'script', 0],
    syncScript: ['groups', 'group', 0, 'syncScript', 0],
    prefs: ['groups', 'group', 0, 'prefs', 0],
  };

  Controller.prototype.actionsIn = {
    jsmolscript: 'Some JSMol Script received',
    jsmolscriptSync: 'Sync jsmol Script to execute',
    setTempJsmolScript: 'Add temporary after load script',
  };

  Controller.prototype.onRemove = function () {
    this.module.view.remove(this.module.getId());
  };

  Controller.prototype.onNewMessage = function (message) {
    this.createDataFromEvent('onMessage', 'message', message);
  };

  Controller.prototype.onAtomClick = function (message) {
    this.createDataFromEvent('onAtomClick', 'atom', message);
  };

  Controller.prototype.onAtomHover = function (message) {
    this.createDataFromEvent('onAtomHover', 'atom', message);
  };

  Controller.prototype.onSyncExecDone = function (message) {
    this.createDataFromEvent('onExecResult', 'execResult', message);
  };

  Controller.prototype.export = function () {
    return this.module.view.postMessage('executeScriptSync', ['write PNGJ jsmol.png']);
  };

  return Controller;
});
