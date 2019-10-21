'use strict';

define([
  'jquery',
  'src/util/api',
  'src/util/util',
  'src/util/color',
  'src/main/grid',
], function ($, API, Util, Color, Grid) {
  return {
    setModule(module) {
      this.module = module;
    },

    init() {
      this.initImpl();
    },

    initImpl() {
      this.resolveReady();
    },

    getToolbar() {
      var tb = this.module.definition.toolbar;
      if (tb) {
        var common = this.module.definition.toolbar.common[0]
          .toolbar[0];
        var custom = this.module.definition.toolbar.custom[0];
      }

      if (!common) common = ['Open Preferences'];

      var toolbar = [
        {
          onClick() {
            this.exportData();
          },
          title: 'Export Data',
          cssClass: 'fa fa-sign-out-alt',
          ifLocked: true,
        },
        {
          onClick() {
            this.printView();
          },
          title: 'Print',
          cssClass: 'fa fa-print',
          ifLocked: true,
        },
        {
          onClick() {
            this.enableFullscreen();
          },
          title: 'Show fullscreen',
          cssClass: 'fa fa-expand',
          ifLocked: true,
        },
        {
          onClick() {
            this.doConfig(2);
          },
          title: 'Open Preferences',
          cssClass: 'fa fa-wrench',
          ifLocked: false,
        },
      ];

      if (common) {
        toolbar = toolbar.filter((t) => {
          return common.some((c) => {
            return c === t.title;
          });
        });
      }

      const customB = [];
      const customE = [];
      if (custom) {
        custom = custom.filter((el) => el.title);
        for (let i = 0; i < custom.length; i++) {
          let el = {
            ifLocked: true,
            title: custom[i].title,
            cssClass: `fa ${custom[i].icon}`,
            color: Color.array2rgba(custom[i].color),
            onClick: function () {
              API.doAction(custom[i].action, this.getId());
            },
          };
          if (custom[i].position === 'begin') {
            customB.push(el);
          } else {
            customE.push(el);
          }
        }
      }

      return customB.concat(toolbar, customE);
    },

    inDom: Util.noop,

    setVarFromEvent(event, rel, relSource, jpath, callback) {
      const varsOut = this.module.vars_out();
      if (!varsOut) {
        return;
      }

      let first = true;
      for (let i = 0; i < varsOut.length; i++) {
        if (
          varsOut[i].event == event &&
                    (varsOut[i].rel == rel || !rel) &&
                    varsOut[i].name
        ) {
          if (first && callback) {
            first = false;
            callback.call(this);
          }

          varsOut[i].jpath = varsOut[i].jpath || []; // Need not be undefined

          if (typeof varsOut[i].jpath == 'string') {
            varsOut[i].jpath = varsOut[i].jpath.split('.');
            varsOut[i].jpath.shift();
          }

          API.setVar(
            varsOut[i].name,
            this.module.getVariableFromRel(relSource),
            jpath.concat(varsOut[i].jpath),
            varsOut[i].filter
          );
        }
      }
    },

    createDataFromEvent(event, rel, data, callback) {
      const varsOut = this.module.vars_out();
      if (!varsOut) {
        return;
      }

      let first = true;
      for (let i = 0; i < varsOut.length; i++) {
        if (
          varsOut[i].event == event &&
                    (varsOut[i].rel == rel || !rel) &&
                    varsOut[i].name
        ) {
          if (first && callback) {
            first = false;
            data = callback.call(this);
          }

          API.createDataJpath(
            varsOut[i].name,
            data,
            varsOut[i].jpath,
            varsOut[i].filter
          );
        }
      }
    },

    sendActionFromEvent(event, rel, value) {
      const actionsOut = this.module.actions_out();

      if (!actionsOut) {
        return;
      }

      for (let i = actionsOut.length - 1; i >= 0; i--) {
        if (
          actionsOut[i].name &&
                    actionsOut[i].rel === rel &&
                    ((event && event === actionsOut[i].event) || !event)
        ) {
          const actionName = actionsOut[i].name;
          const jpath = actionsOut[i].jpath;

          if (value && jpath) {
            if (!value.getChild) {
              value = DataObject.check(value, true);
            }

            value.getChild(jpath).then((returned) => {
              API.doAction(actionName, returned);
            });
          } else {
            API.doAction(actionName, value);
          }
        }
      }
    },

    sendAction: Util.deprecate(function sendAction(rel, value, event) {
      return this.sendActionFromEvent(event, rel, value);
    }, 'Use sendActionFromEvent instead.'),

    allVariablesFor(event, rel, callback) {
      const varsOut = this.module.vars_out();
      if (!varsOut) {
        return;
      }

      for (let i = 0; i < varsOut.length; i++) {
        if (
          varsOut[i].event == event &&
                    (varsOut[i].rel == rel || !rel)
        ) {
          callback(varsOut[i]);
        }
      }
    },

    export: Util.noop,

    print() {
      const $dom = this.module.getDomContent();
      const $domCopy = $dom.clone();
      const $canvas = $dom.find('canvas');
      const $canvasCopy = $domCopy.find('canvas');

      $canvas.each(function (index) {
        const dataUrl = this.toDataURL();
        const img = new Image();
        img.src = dataUrl;
        img.width = this.width;
        img.height = this.height;
        $($canvasCopy[index]).after(img);
        $($canvasCopy[index]).remove();
      });
      return $domCopy[0];
    },

    configurationStructure: Util.noop,

    configFunctions: {},

    configAliases: {},

    defaultReferences: {
      _moduleId: {
        label: 'Module id',
      },
      _loadTime: {
        label: 'Loading time',
      },
      _moduleUrl: {
        label: 'Module URL',
      },
      _varName: {
        label: 'Variable name',
        type: 'string',
      },
    },

    references: {},

    defaultEvents: {
      _onLoaded: {
        label: 'Module loaded',
        refAction: ['_loadTime', '_moduleUrl', '_moduleId'],
      },
      _onVarUpdated: {
        label: 'Variable updated',
        refAction: ['_varName'],
      },
    },

    events: {},

    variablesIn: [],

    defaultActionsIn: {
      _editPreferences: 'Edit preferences',
      _print: 'Print module content',
    },
    actionsIn: {},

    resolveReady() {
      this.module._resolveController();
    },

    onBeforeRemove() {
      return true;
    },

    onRemove: Util.noop,
  };
});
