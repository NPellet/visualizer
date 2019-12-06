'use strict';

/* eslint-disable import/no-unresolved */

define(
  [
    'jquery',
    'lodash',
    'src/util/context',
    'src/util/api',
    'src/util/util',
    'src/util/fullscreen',
    'src/util/debug',
    'src/main/datas',
    'src/main/variables',
    'src/util/ui',
    'version',
    'forms/form',
    'src/main/grid'
  ],
  function (
    $,
    _,
    ContextMenu,
    API,
    Util,
    Fullscreen,
    Debug,
    Datas,
    Variables,
    ui,
    Version,
    Form
  ) {
    function init(module) {
      // define object properties
      var originalURL = String(
        module.definition.getChildSync(['url'], true).get()
      );
      var moduleURL = Util.rewriteRequirePath(originalURL);
      if (moduleURL[moduleURL.length - 1] !== '/') {
        moduleURL = `${moduleURL}/`;
      }

      module.viewReady = new Promise(function (res, rej) {
        module._resolveView = res;
      });

      module.controllerReady = new Promise(function (res, rej) {
        module._resolveController = res;
      });

      module.modelReady = new Promise(function (res, rej) {
        module._resolveModel = res;
      });

      module.globalInitializationReady = new Promise(function (res, rej) {
        module.resolveGlobal = res;
      });

      const start = Date.now();
      module._onReady = Promise.all([
        module.viewReady,
        module.controllerReady,
        module.modelReady,
        module.globalInitializationReady,
      ]);
      module._onReady
        .then(
          () => {
            module.controller.sendActionFromEvent(
              '_onLoaded',
              '_moduleUrl',
              moduleURL
            );
            module.controller.sendActionFromEvent(
              '_onLoaded',
              '_loadTime',
              Date.now() - start
            );
            module.controller.sendActionFromEvent(
              '_onLoaded',
              '_moduleId',
              module.getId()
            );
            return module.updateAllView();
          },
          function (err) {
            Debug.error('Caught error in module ready state', err);
          }
        )
        .catch(function (err) {
          Debug.error('Caught error while updating module', err);
        });

      return new Promise(function (resolve, reject) {
        if (!moduleURL) {
          reject(new Error('no module URL'));
          return;
        }

        if (
          Version.includedModuleCss.indexOf(
            Util.moduleIdFromUrl(originalURL)
          ) > -1
        ) {
          module._cssLoaded = Promise.resolve();
        } else {
          module._cssLoaded = Util.loadCss(`${moduleURL}style.css`);
        }
        require([
          `${moduleURL}model`,
          `${moduleURL}view`,
          `${moduleURL}controller`
        ], function (M, V, C) {
          module.model = new M();
          module.view = new V();
          module.controller = new C();

          if (!module.controller.moduleInformation) {
            return;
          }

          module.dom = $(module.buildDom());
          module.bindToolbar();

          module.domContent = module.dom
            .children()
            .children('.ci-module-content');
          module.domHeader = module.dom
            .children()
            .children('.ci-module-header');
          module.domLoading = module.dom
            .children()
            .children('.ci-module-loading');
          module.domWrapper = module.dom;

          module.view.setModule(module);
          module.controller.setModule(module);
          module.model.setModule(module);

          module.view.initDefault();
          module.view.init();
          module.controller.init();
          module.model.init();

          resolve(module);
        }, function (err) {
          return reject(err);
        });
      });
    }

    function Module(definition) {
      this.getConfiguration = this.getConfiguration.bind(this);
      this.getConfigurationCheckbox = this.getConfigurationCheckbox.bind(
        this
      );

      this.definition = DataObject.recursiveTransform(definition);
      this.definition.configuration =
                this.definition.configuration || new DataObject();
      this.definition.layers = this.definition.layers || new DataObject(); // View on which layers ?

      this.ready = init(this).then(() => {
        if (Object.keys(this.definition.configuration).length === 0) {
          const form = this.getConfigForm();
          return Promise.resolve(
            form.onLoaded().then(() => {
              savePreferences(this, form, true);
            })
          );
        }
      });
      this.ready.catch(function (err) {
        Debug.error('Caught error in module initialization.', err);
      });
    }

    Module.prototype = {
      buildDom() {
        var html = '';
        html +=
                    '<div class="ci-module-wrapper ci-module-displaywrapper ci-module-';
        html += this.controller.moduleInformation.cssClass;

        html += '" data-module-id="';
        html += this.definition.id;
        html += '"';

        html += ' style="z-index: ';
        html += this.definition.zindex || 0;
        html += '"';

        html += '><div class="ci-module"><div class="ci-module-header';

        html += '"><div class="ci-module-header-title">';
        html += this.definition.title;
        html += '</div>';
        html += '<div class="ci-module-header-toolbar">';
        html += '<ul>';
        html += '</ul>';
        html += '</div>';
        html += '</div><div class="ci-module-content">';

        html += '</div>';

        html += '<div class="ci-module-loading">Loading ...</div>';
        html += '</div>';
        return html;
      },

      setCustomStyle() {
        var css = this.definition.css;
        if (!css) return;
        css = css[0];
        var style = {
          fontSize: css.fontSize[0],
          fontFamily: css.fontFamily[0]
        };
        this.dom.find('.ci-module-content').css(style);
      },

      drawToolbar() {
        var isLocked = API.isViewLocked();
        var $ul = this.dom.find('.ci-module-header-toolbar ul');
        var toolbar = this.controller.getToolbar();
        var html = '';
        for (var i = 0; i < toolbar.length; i++) {
          if (!toolbar[i].ifLocked && isLocked) continue;
          const color = toolbar[i].color || 'rgba(100,100, 100, 1)';
          html += `<li style="color:${toolbar[i].color}" + title="${toolbar[i].title || ''}">`;
          if (toolbar[i].icon) {
            html += `<div style="color=${color}"><i src="${toolbar[i].icon}"/></div>`;
          }
          if (toolbar[i].cssClass) {
            html +=
                            `<span style="color: ${color};" class="${
                              toolbar[i].cssClass
                            }"/>`;
          }
          html += '</li>';
        }
        $ul.html(html);
      },

      bindToolbar() {
        var that = this;
        this.dom
          .find('.ci-module-header-toolbar ul')
          .on('click', 'li', (event) => {
            var toolbar = that.controller.getToolbar();
            var title = $(event.target)
              .closest('li')
              .attr('title');
            var t = _.find(toolbar, (val) => val.title === title);
            if (t && t.onClick) {
              t.onClick.apply(that);
            }
          });
      },

      onReady() {
        return this._onReady;
      },

      async updateView(rel, varValue, varName) {
        if (!this.view.update[rel] && this.view[`_update_${rel}`]) {
          await this.view[`_update_${rel}`](varValue, varName);
        } else {
          await this.view.update[rel].call(
            this.view,
            varValue,
            varName
          );
        }

        this.controller.sendActionFromEvent(
          '_onVarUpdated',
          '_varName',
          varName
        );
      },

      async updateAllView() {
        if (!this.view.update || !this.definition) {
          return;
        }
        const vars = this.vars_in();
        for (let i = 0; i < vars.length; i++) {
          const variable = API.getVar(vars[i].name);
          if (variable.isDefined()) {
            // eslint-disable-next-line no-await-in-loop
            await this.model.onVarChange(variable);
          }
        }
      },

      /*
         * Returns the DOM object which corresponds to the module's content
         */
      getDomContent() {
        if (typeof this.domContent !== 'undefined')
          return this.domContent;
        throw new Error('The module has not been loaded yet');
      },

      /*
         * Returns the DOM object which corresponds to the module's wrapper
         */
      getDomWrapper() {
        if (typeof this.domWrapper !== 'undefined') {
          return this.domWrapper;
        }
        throw new Error('The module has not been loaded yet');
      },

      /*
         * Returns the DOM object which corresponds to the module's view
         */
      getDomView() {
        if (typeof this.view.getDom == 'function') {
          return this.view.getDom();
        }
        throw new Error(
          "The module's view doest not implement the getDom function"
        );
      },

      /*
         * Returns the DOM object which corresponds to the module's header
         */
      getDomHeader() {
        if (typeof this.domHeader !== 'undefined') {
          return this.domHeader;
        }
        throw new Error('The module has not been loaded yet');
      },

      /*
         * Returns all accepted types defined in the controller
         */
      getAcceptedTypes(rel) {
        var accept = this.controller.references;
        if (accept) {
          return accept[rel];
        }
        return false;
      },

      getDataFromRel(rel) {
        if (!this.model || !this.model.data) {
          return;
        }
        var data = this.model.data[rel];
        if (data) {
          return data[Object.keys(data)[0]];
        }
        return false;
      },

      getVariableFromRel(rel) {
        var name = this.getNameFromRel(rel);
        return API.getVar(name);
      },

      getNameFromRel(rel) {
        var vars = this.vars_in();
        for (var i = 0; i < vars.length; i++) {
          if (vars[i].rel == rel) {
            return vars[i].name;
          }
        }
        return false;
      },

      getData() {
        return this.model.data;
      },

      getDataRelFromName(name) {
        var vars = this.vars_in();
        var rels = [];
        for (var i = 0; i < vars.length; i++) {
          if (vars[i].name == name) {
            rels.push(vars[i].rel);
          }
        }
        return rels;
      },

      getActionRelFromName(name) {
        var vars = this.actions_in();
        for (var i = 0; i < vars.length; i++) {
          if (vars[i].name == name) {
            return vars[i].rel;
          }
        }
        return false;
      },

      inDom() {
        this.drawToolbar();
        this.setCustomStyle();
        this.view.inDom();
        this.controller.inDom();
        this.model.inDom();

        var that = this;
        if (!API.isViewLocked()) {
          ContextMenu.listen(this.getDomWrapper().get(0), [
            [
              '<li name="fullscreen"><a><span class="ui-icon ui-icon-arrow-4-diag"></span> Fullscreen</a></li>',
              function () {
                that.enableFullscreen();
              }
            ],
            [
              '<li name="export"><a><span class="ui-icon ui-icon-suitcase"></span> Export</a></li>',
              function () {
                that.exportData();
              }
            ],
            [
              '<li name="config-example"><a><span class="ui-icon ui-icon-suitcase"></span> Config example</a></li>',
              function () {
                that.exportConfigExample();
              }
            ],
            [
              '<li name="print"><a><span class="ui-icon ui-icon-print"></span> Print</a></li>',
              function () {
                that.printView();
              }
            ],
            [
              '<li name="configuration"><a><span class="ui-icon ui-icon-gear"></span> Parameters</a></li>',
              function () {
                that.doConfig();
              }
            ]
          ]);
        }
      },

      enableFullscreen() {
        Fullscreen.requestFullscreen(this);
      },

      toggleLayer(newLayerShown, layerOut) {
        var layer;
        this.activeLayerName = newLayerShown;
        if ((layer = this.getLayer(newLayerShown))) {
          if (!layer.display) {
            this.hide();
            return;
          } else {
            this.show();
          }

          this.setTitle(layer.title);
          this.setDisplayWrapper(layer.wrapper);

          this.setBackgroundColor(
            layer.bgColor || [255, 255, 255, 1]
          );

          var Grid = require('src/main/grid');
          Grid.setModuleSize(this);
          Grid.moduleResize(this);

          return layer;
        }
      },

      eachLayer(callback) {
        for (var i in this.definition.layers) {
          callback(this.definition.layers[i], i);
        }
      },

      setLayers(layers, blankLayer, modify_layer, blank, activeLayer) {
        this.definition.layers =
                    this.definition.layers || new DataObject();

        if (modify_layer) {
          if (modify_layer.remove) {
            delete this.definition.layers[modify_layer.remove];
          } else if (modify_layer.rename) {
            this.definition.layers[
              modify_layer.rename.new
            ] = this.definition.layers[modify_layer.rename.old];
            delete this.definition.layers[modify_layer.rename.old];
          }
        } else {
          for (var i in layers) {
            if (this.definition.layers[i]) {
              continue;
            }

            // new layer
            this.definition.layers[i] = new DataObject();

            if (blankLayer) {
              $.extend(
                true,
                this.definition.layers[i],
                Module.prototype.emptyConfig
              );
              this.definition.layers[i].name = i;
              if (i !== activeLayer) {
                this.definition.layers[i].display = false;
              }
            } else {
              $.extend(
                true,
                this.definition.layers[i],
                this.getLayer(this.getActiveLayerName())
              );
              if (
                blank ||
                                activeLayer !== this.getActiveLayerName()
              ) {
                this.definition.layers[i].display = false;
              }
            }

            this.definition.layers[i] = this.definition.layers[
              i
            ].duplicate();
          }
        }
      },

      getActiveLayerName() {
        return this.activeLayerName;
      },

      getLayer(layerName) {
        if (!layerName) {
          return false;
        }
        return this.definition.layers[layerName];
      },

      hide() {
        this.getDomWrapper().hide();
      },

      show() {
        this.getDomWrapper().show();
      },

      getConfigForm() {
        const that = this;

        const references = Object.assign(
          {},
          this.controller.defaultReferences,
          this.controller.references
        );
        const events = Object.assign(
          {},
          this.controller.defaultEvents,
          this.controller.events
        );
        const actionsIn = Object.assign(
          {},
          this.controller.defaultActionsIn,
          this.controller.actionsIn
        );

        const filters = makeFilters(API.getAllFilters());

        const autoCompleteVariables = Util.stringsToAutocomplete(
          Variables.getNames()
        );
        const autoCompleteActions = Util.stringsToAutocomplete(
          API.getRepositoryActions().getKeys()
        );

        const varsInList = this.controller.variablesIn
          .filter((variable) => references[variable])
          .map((variable) => ({
            key: variable,
            title: references[variable].label
          }));

        const alljpaths = {};
        Object.keys(references).forEach((ref) => {
          alljpaths[ref] = this.model.getjPath(ref);
        });

        const eventsVariables = [];
        const eventsActions = [];
        for (const event in events) {
          if (events[event].refVariable) {
            eventsVariables.push({
              key: event,
              title: events[event].label
            });
          }
          if (events[event].refAction) {
            eventsActions.push({
              key: event,
              title: events[event].label
            });
          }
        }

        const actionsInList = [];
        for (const action in actionsIn) {
          actionsInList.push({
            key: action,
            title: actionsIn[action]
          });
        }

        const allLayers = {};
        this.eachLayer(function (layer, key) {
          allLayers[key] = key;
        });

        const structure = {
          sections: {
            module_infos: {
              options: {
                title: 'Module informations',
                icon: 'info_rhombus'
              },
              groups: {
                group: {
                  options: {
                    type: 'text'
                  }
                }
              }
            },
            module_config: {
              options: {
                title: 'General configuration',
                icon: 'page_white_paint'
              },
              groups: {
                layerDisplay: {
                  options: {
                    title: 'Display on layers',
                    type: 'list'
                  },
                  fields: {
                    displayOn: {
                      type: 'checkbox',
                      title: 'Display on layers',
                      options: allLayers
                    }
                  }
                },
                commonToolbar: {
                  options: {
                    title: 'Common toolbar options',
                    type: 'list'
                  },
                  fields: {
                    toolbar: {
                      type: 'checkbox',
                      title: 'Common toolbar options',
                      options: {
                        'Open Preferences':
                                                    'Open Preferences',
                        'Show fullscreen':
                                                    'Show fullscreen',
                        'Export Data': 'Export Data',
                        Print: 'Print'
                      },
                      default: ['Open Preferences']
                    }
                  }
                },
                customToolbar: {
                  options: {
                    title: 'Custom toolbar options',
                    type: 'table',
                    multiple: true
                  },
                  fields: {
                    title: {
                      type: 'text',
                      title: 'Title',
                      default: ''
                    },
                    icon: {
                      title: 'Icon',
                      type: 'text',
                      default: ''
                    },
                    action: {
                      title: 'Action',
                      type: 'text',
                      default: ''
                    },
                    position: {
                      title: 'Position',
                      type: 'combo',
                      options: [
                        { key: 'begin', title: 'Begin' },
                        { key: 'end', title: 'End' }
                      ],
                      default: 'begin'
                    },
                    color: {
                      title: 'Color',
                      type: 'spectrum',
                      default: [100, 100, 100, 1]
                    }
                  }
                },
                customCss: {
                  options: {
                    title: 'Custom css',
                    type: 'list'
                  },
                  fields: {
                    fontSize: {
                      type: 'text',
                      title: 'Font size',
                      default: ''
                    },
                    fontFamily: {
                      type: 'text',
                      title: 'Font Family',
                      default: ''
                    }
                  }
                }
              },
              sections: {
                layer: {
                  options: {
                    title: 'Shown on layers'
                  },
                  groups: {
                    group: {
                      options: {
                        type: 'list',
                        multiple: true,
                        title: true
                      },
                      fields: {
                        layerName: {
                          type: 'text',
                          multiple: false,
                          title: 'Layer name',
                          displayed: false
                        },
                        moduletitle: {
                          type: 'text',
                          multiple: false,
                          title: 'Module title'
                        },
                        bgcolor: {
                          type: 'spectrum',
                          multiple: false,
                          title: 'Background color'
                        },
                        modulewrapper: {
                          type: 'checkbox',
                          title: 'Module boundaries',
                          options: { display: '' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };

        const specificStructure = this.controller.configurationStructure();
        if (specificStructure) {
          structure.sections.module_specific_config = Object.assign(
            specificStructure,
            {
              options: {
                title: 'Module configuration',
                icon: 'page_white_wrench'
              }
            }
          );
        }

        if (varsInList.length > 0) {
          structure.sections.vars_in = {
            options: {
              title: 'Variables in',
              icon: 'basket_put'
            },
            groups: {
              group: {
                options: {
                  type: 'table',
                  multiple: true
                },
                fields: {
                  rel: {
                    type: 'combo',
                    title: 'Reference',
                    options: varsInList
                  },
                  name: {
                    type: 'text',
                    title: 'From variable',
                    options: autoCompleteVariables
                  },
                  filter: {
                    type: 'combo',
                    title: 'Filter variable',
                    options: filters
                  }
                }
              }
            }
          };
        }

        if (eventsVariables.length > 0) {
          structure.sections.vars_out = {
            options: {
              title: 'Variables out',
              icon: 'basket_remove'
            },
            groups: {
              group: {
                options: {
                  type: 'table',
                  multiple: true
                },
                fields: {
                  event: {
                    type: 'combo',
                    title: 'Event',
                    options: eventsVariables
                  },
                  rel: {
                    type: 'combo',
                    title: 'Reference'
                  },
                  jpath: {
                    type: 'combo',
                    title: 'jPath',
                    options: {},
                    extractValue: Util.jpathToArray,
                    insertValue: Util.jpathToString
                  },
                  filter: {
                    type: 'combo',
                    title: 'Filter variable',
                    options: filters
                  },
                  name: {
                    type: 'text',
                    title: 'To variable'
                  }
                }
              }
            }
          };
        }

        if (actionsInList.length > 0) {
          structure.sections.actions_in = {
            options: {
              title: 'Actions in',
              icon: 'door_in'
            },
            groups: {
              group: {
                options: {
                  type: 'table',
                  multiple: true
                },
                fields: {
                  rel: {
                    type: 'combo',
                    title: 'Reference',
                    options: actionsInList
                  },
                  name: {
                    type: 'text',
                    title: 'Action name',
                    options: autoCompleteActions
                  }
                }
              }
            }
          };
        }

        if (eventsActions.length > 0) {
          structure.sections.actions_out = {
            options: {
              title: 'Actions out',
              icon: 'door_out'
            },
            groups: {
              group: {
                options: {
                  type: 'table',
                  multiple: true
                },
                fields: {
                  event: {
                    type: 'combo',
                    title: 'On event',
                    options: eventsActions
                  },
                  rel: {
                    type: 'combo',
                    title: 'Reference'
                  },
                  jpath: {
                    type: 'combo',
                    title: 'jPath',
                    options: {},
                    extractValue: Util.jpathToArray,
                    insertValue: Util.jpathToString
                  },
                  name: {
                    type: 'text',
                    title: 'Action name'
                  }
                }
              }
            }
          };
        }

        const form = new Form();
        form.init();
        form.setStructure(structure);

        form.onStructureLoaded().then(function () {
          if (form.getSection('vars_out')) {
            form
              .getSection('vars_out')
              .getGroup('group')
              .getField('event').options.onChange = function (
                fieldElement
              ) {
                if (!fieldElement.groupElement) {
                  return;
                }
                $.when(
                  fieldElement.groupElement.getFieldElementCorrespondingTo(
                    fieldElement,
                    'rel'
                  )
                ).then(function (el) {
                  if (el) {
                    el.setOptions(
                      makeReferences(
                        fieldElement.value,
                        'event'
                      )
                    );
                  }
                });
              };

            form
              .getSection('vars_out')
              .getGroup('group')
              .getField('rel').options.onChange = function (
                fieldElement
              ) {
                if (!fieldElement.groupElement) {
                  return;
                }
                $.when(
                  fieldElement.groupElement.getFieldElementCorrespondingTo(
                    fieldElement,
                    'jpath'
                  )
                ).then(function (el) {
                  if (el) {
                    el.setOptions(
                      alljpaths[fieldElement.value]
                    );
                  }
                });
              };
          }

          if (form.getSection('actions_out')) {
            form
              .getSection('actions_out')
              .getGroup('group')
              .getField('event').options.onChange = function (
                fieldElement
              ) {
                if (!fieldElement.groupElement) {
                  return;
                }
                $.when(
                  fieldElement.groupElement.getFieldElementCorrespondingTo(
                    fieldElement,
                    'rel'
                  )
                ).then(function (el) {
                  if (el) {
                    el.setOptions(
                      makeReferences(
                        fieldElement.value,
                        'action'
                      )
                    );
                  }
                });
              };

            form
              .getSection('actions_out')
              .getGroup('group')
              .getField('rel').options.onChange = function (
                fieldElement
              ) {
                if (!fieldElement.groupElement) {
                  return;
                }
                $.when(
                  fieldElement.groupElement.getFieldElementCorrespondingTo(
                    fieldElement,
                    'jpath'
                  )
                ).then(function (el) {
                  if (el) {
                    el.setOptions(
                      alljpaths[fieldElement.value]
                    );
                  }
                });
              };
          }

          const moduleInfosHtml =
                        `${'<table class="moduleInformation">' +
                        '<tr><td>Module name</td><td>'}${
                          that.controller.moduleInformation.name
                        }</td></tr>` +
                        `<tr><td></td><td><small>${
                          that.controller.moduleInformation.description
                        }</small></td></tr>` +
                        `<tr><td>Module author</td><td>${
                          that.controller.moduleInformation.author
                        }</td></tr>` +
                        `<tr><td>Creation date</td><td>${
                          that.controller.moduleInformation.date
                        }</td></tr>` +
                        `<tr><td>Released under</td><td>${
                          that.controller.moduleInformation.license
                        }</td></tr>` +
                        '</table>';

          const allLayers = [];
          const allLayerDisplay = [];

          let commonToolbar, customToolbar;
          if (that.definition.toolbar) {
            commonToolbar = that.definition.toolbar.common;
            customToolbar = that.definition.toolbar.custom;
          }

          let customCss;
          if (that.definition.css) {
            customCss = that.definition.css;
          }

          that.eachLayer(function (layer, name) {
            if (layer.display) {
              allLayerDisplay.push(name);
            }
            allLayers.push({
              _title: name,
              layerName: [name],
              moduletitle: [layer.title],
              bgcolor: [layer.bgColor || [255, 255, 255, 0]],
              modulewrapper: [
                layer.wrapper === true ||
                                layer.wrapper === undefined
                  ? 'display'
                  : ''
              ]
            });
          });

          form.fill({
            sections: {
              module_config: [
                {
                  groups: {
                    layerDisplay: [{ displayOn: [allLayerDisplay] }],
                    commonToolbar,
                    customToolbar,
                    customCss
                  },
                  sections: {
                    layer: [{ groups: { group: allLayers } }]
                  }
                }
              ],
              module_infos: [{ groups: { group: [moduleInfosHtml] } }],
              module_specific_config: [that.definition.configuration || {}],
              vars_out: [{ groups: { group: [that.vars_out()] } }],
              vars_in: [{ groups: { group: [that.vars_in()] } }],
              actions_in: [{ groups: { group: [that.actions_in()] } }],
              actions_out: [{ groups: { group: [that.actions_out()] } }]
            }
          });
        });

        return form;

        function makeReferences(event, type) {
          if (!events[event]) {
            return [];
          }

          let referenceList;
          switch (type) {
            case 'event':
              referenceList = events[event].refVariable || [];
              break;
            case 'action':
              referenceList = events[event].refAction || [];
              break;
          }

          return referenceList.map((ref) => ({
            key: ref,
            title: references[ref].label
          }));
        }
      },

      doConfig(sectionToOpen = 2) {
        const div = ui.dialog({
          autoPosition: true,
          noHeader: true,
          width: '80%'
        });
        const form = this.getConfigForm();
        form.addButton('Cancel', { color: 'blue' }, () =>
          div.dialog('close')
        );
        form.addButton('Save', { color: 'green' }, () => {
          savePreferences(this, form);
          div.dialog('close');
        });
        form.onLoaded().then(() => {
          div.html(form.makeDom(1, sectionToOpen));
          form.inDom();
        });
      },

      resetReady() {
        var that = this;
        that.viewReady = new Promise(function (res) {
          that._resolveView = res;
        });

        that.controllerReady = new Promise(function (res) {
          that._resolveController = res;
        });
        that._onReady = Promise.all([
          that.viewReady,
          that.controllerReady
        ]);
      },

      getConfiguration(aliasName, fallbackValue, resurrectValue = true) {
        var cfgEl = this.definition.configuration;
        var alias = this.controller.configAliases[aliasName];
        var toReturn;

        if (alias) {
          for (var i = 0; i < alias.length; i++) {
            cfgEl = cfgEl[alias[i]];
            if (typeof cfgEl === 'undefined') {
              toReturn = this._getConfigurationDefault(
                alias,
                aliasName
              );
              break;
            }
          }
        } else {
          Debug.warn(`Alias ${aliasName} not defined `);
        }

        if (toReturn == undefined)
          toReturn = this._doConfigurationFunction(cfgEl, aliasName);
        if (toReturn == undefined) toReturn = fallbackValue;

        return resurrectValue ? Datas.resurrect(toReturn) : toReturn;
      },

      getConfigurationCheckbox(aliasName, optionName) {
        var conf = this.getConfiguration(aliasName);
        if (!Array.isArray(conf)) {
          return false;
        }

        return conf.indexOf(optionName) > -1;
      },

      _getConfigurationDefault(alias, aliasName) {
        this._cfgStructure =
                    this._cfgStructure ||
                    this.controller.configurationStructure();

        var cfgEl = this._cfgStructure;

        for (var i = 0, l = alias.length; i < l; i++) {
          if (typeof alias[i] == 'number') {
            continue;
          }

          if (cfgEl.fields) {
            i--;
            cfgEl = cfgEl.fields;
            continue;
          }

          cfgEl = cfgEl[alias[i]];
          if (!cfgEl) {
            Debug.warn(
              'Error in configuration file - Alias is not a correct jPath'
            );
            return false;
          }
        }

        return this._doConfigurationFunction(cfgEl.default, aliasName);
      },

      _doConfigurationFunction(element, aliasName) {
        if (this.controller.configFunctions[aliasName]) {
          try {
            return this.controller.configFunctions[aliasName](
              element
            );
          } catch (e) {
            return element;
          }
        }
        return element;
      },

      /*
         * Returns the data for the module's model
         */
      getValue() {
        if (typeof this.model.getValue == 'function')
          return this.model.getValue();
      },

      /*
         * Returns the current position of the module
         */
      getPosition(activeLayer) {
        var layer = this.getLayer(activeLayer);
        return layer.position;
      },

      /*
         * Returns the current size of the module
         */
      getSize(activeLayer) {
        var layer = this.getLayer(activeLayer);
        return layer.size;
      },

      getWidthPx() {
        return this.getDomContent().innerWidth();
      },

      getHeightPx() {
        return this.getDomContent().innerHeight();
      },

      getId() {
        return DataObject.resurrect(this.definition.id);
      },

      setId(id) {
        this.definition.set('id', id);
      },

      setSourceVars(vars) {
        this.definition.set('vars_in', vars, true);
      },

      setSendVars(vars) {
        this.definition.set('vars_out', vars, true);
      },

      setActionsIn(vars) {
        this.definition.set('actions_in', vars, true);
      },

      setActionsOut(vars) {
        this.definition.set('actions_out', vars, true);
      },

      vars_in() {
        // Backward compatibility
        if (!this.definition.vars_in && this.definition.dataSource) {
          this.definition.vars_in = this.definition.dataSource;
          delete this.definition.dataSource;
        }
        this.definition.vars_in =
                    this.definition.vars_in || new DataArray();
        return this.definition.vars_in.filter(function (val) {
          return val ? (val.name && val.rel ? true : false) : false;
        });
      },

      vars_out() {
        // Backward compatibility
        if (!this.definition.vars_out && this.definition.dataSend) {
          this.definition.vars_out = this.definition.dataSend;
          delete this.definition.dataSend;
        }
        if (!this.definition.vars_out)
          this.definition.vars_out = new DataArray();
        return this.definition.vars_out;
      },

      actions_in() {
        // Backward compatibility
        if (!this.definition.actions_in && this.definition.actionsIn) {
          this.definition.actions_in = this.definition.actionsIn;
          delete this.definition.actionsIn;
        }
        if (!this.definition.actions_in)
          this.definition.actions_in = new DataArray();
        return this.definition.actions_in;
      },

      actions_out() {
        // Backward compatibility
        if (
          !this.definition.actions_out &&
                    this.definition.actionsOut
        ) {
          this.definition.actions_out = this.definition.actionsOut;
          delete this.definition.actionsOut;
        }
        if (!this.definition.actions_out)
          this.definition.actions_out = new DataArray();
        return this.definition.actions_out;
      },

      getDefinition() {
        return this.definition;
      },

      getTitle() {
        return this.definition.title;
      },

      setTitle(title) {
        this.definition.set('title', title);
        this.domHeader.find('.ci-module-header-title').text(title);
      },

      async exportData() {
        const text = await this.controller.export();
        if (typeof text === 'string') {
          ui
            .dialog(
              '<div class="ci-module-export"><textarea></textarea></div>',
              {
                title:
                                    `Export data from module ${
                                      this.getTitle()}`,
                width: '70%',
                height: 500,
                noWrap: true
              }
            )
            .children('textarea')
            .text(text);
        }
      },

      printView(options) {
        const domContent = this.controller.print();
        if (options && options.window) {
          var openWindow = options.window;
        } else {
          var openWindow = window.open('', '', '');
        }
        openWindow.document.body.appendChild(domContent);
        openWindow.document.close();
        openWindow.focus();
        // need async to be able to render some twig rendertype
        window.setTimeout(function () {
          openWindow.print();
          openWindow.close();
        }, options.delay || 100);
      },

      setBackgroundColor(color) {
        this.domContent.get(0).style.backgroundColor =
                    `rgba(${color.join(',')})`;
      },

      setDisplayWrapper(bln) {
        this.getDomWrapper()[
          bln === true || bln == undefined
            ? 'addClass'
            : 'removeClass'
        ]('ci-module-displaywrapper');
        try {
          this.getDomWrapper().resizable(
            bln === true || bln == undefined ? 'enable' : 'disable'
          );
        } catch (e) {
          // do nothing
        }
      },

      blankVariable(variableName) {
        const rels = this.getDataRelFromName(variableName);
        for (let i = 0; i < rels.length; i++) {
          if (
            !this.view.blank[rels[i]] &&
                        this.view[`_blank_${rels[i]}`]
          ) {
            this.view[`_blank_${rels[i]}`](variableName);
          } else {
            if (this.view.blank[rels[i]]) {
              this.view.blank[rels[i]].call(
                this.view,
                variableName
              );
            } else {
              Util.warnOnce(
                `missing-blank-${
                  this.controller.moduleInformation.name
                }_${rels[i]}`,
                `Module ${
                  this.controller.moduleInformation.name
                }: no blank method defined for rel ${rels[i]}`
              );
            }
          }
        }
        return null;
      },

      startLoading(variableName) {
        const rels = this.getDataRelFromName(variableName);
        for (let i = 0; i < rels.length; i++) {
          this.view.startLoading(rels[i]);
        }
      },

      endLoading(variableName) {
        const rels = this.getDataRelFromName(variableName);
        for (let i = 0; i < rels.length; i++) {
          this.view.endLoading(rels[i]);
        }
      },

      get emptyConfig() {
        return new DataObject({
          position: { left: 0, top: 0 },
          size: { width: 20, height: 20 },
          zIndex: 0,
          display: true,
          title: '',
          bgColor: [255, 255, 255, 0],
          wrapper: true,
          created: true
        });
      },

      reload() {
        if (this.view.unload) {
          this.view.unload();
        }
        this.resetReady();
        this.controller.init();
        this.view.init();
        this.drawToolbar();
        this.setCustomStyle();
        this.view.inDom();
        this.toggleLayer(this.getActiveLayerName());
        this.model.resetListeners();
        this.updateAllView();
      },

      getConfigExample() {
        var aliases = this.controller.configAliases,
          definition = this.controller.configurationStructure();

        var result = {};
        for (var i in aliases) {
          if (aliases.hasOwnProperty(i)) {
            result[i] = getExampleFromAlias(definition, aliases[i]);
          }
        }

        return result;
      },

      exportConfigExample() {
        var that = this;
        ui
          .dialog(
            '<div class="ci-module-export"><textarea></textarea></div>',
            {
              title: 'Config example',
              width: '70%',
              height: 500,
              noWrap: true
            }
          )
          .children('textarea')
          .text(JSON.stringify(that.getConfigExample(), null, 4));
      }
    };

    function savePreferences(self, form, noReload) {
      const value = form.getValue().sections;
      if (self.controller.onBeforeSave) {
        self.controller.onBeforeSave(value);
      }
      self.definition.layers = self.definition.layers || {};
      const l = value.module_config[0].sections.layer[0].groups.group;
      const allDisplay =
                value.module_config[0].groups.layerDisplay[0].displayOn[0];
      for (var i = 0; i < l.length; i++) {
        self.definition.layers[l[i].layerName[0]].display =
                    allDisplay.indexOf(l[i].layerName[0]) > -1;
        self.definition.layers[l[i].layerName[0]].title =
                    l[i].moduletitle[0];
        self.definition.layers[l[i].layerName[0]].bgColor =
                    l[i].bgcolor[0];
        self.definition.layers[l[i].layerName[0]].wrapper =
                    l[i].modulewrapper[0].indexOf('display') > -1;
      }

      self.definition.toolbar = {};
      self.definition.toolbar.custom =
                value.module_config[0].groups.customToolbar;
      self.definition.toolbar.common =
                value.module_config[0].groups.commonToolbar;

      self.definition.css = value.module_config[0].groups.customCss;

      if (value.vars_out) {
        self.setSendVars(value.vars_out[0].groups.group[0]);
      }

      if (value.vars_in) {
        self.setSourceVars(value.vars_in[0].groups.group[0]);
      }

      if (value.actions_in) {
        self.setActionsIn(value.actions_in[0].groups.group[0]);
      }

      if (value.actions_out) {
        self.setActionsOut(value.actions_out[0].groups.group[0]);
      }

      if (value.module_specific_config) {
        self.definition.configuration = value.module_specific_config[0];
      }

      if (!noReload) {
        self.reload();
      }
    }

    function getExampleFromAlias(element, alias) {
      var l = alias.length,
        name;
      for (var i = 0; i < l; i++) {
        if (!element) break;
        name = alias[i];
        if (typeof name === 'string') {
          element = element[name];
        } else if (i === l - 1) {
          if (element.options) {
            if (element.options.type === 'table') {
              var tableElement = getTableFieldExample(
                element.fields
              );
              if (element.options.multiple) {
                tableElement = [tableElement];
              }
              return tableElement;
            } else {
              return getFieldExample(element);
            }
          } else {
            return getFieldExample(element);
          }
        } else if (element.fields) {
          element = element.fields;
        }
      }
    }

    function getTableFieldExample(field) {
      var result = {};
      for (var i in field) {
        if (field.hasOwnProperty(i)) {
          result[i] = getFieldExample(field[i]);
        }
      }
      return result;
    }

    function getFieldExample(field) {
      switch (field.type) {
        case 'checkbox':
          var result = [];
          for (var i in field.options) {
            result.push(i);
          }
          return result;
        case 'color':
        case 'spectrum':
          return [0, 0, 0, 1];
        case 'combo':
          var val = field.options[0];
          if (val) {
            val = val.key;
          } else {
            val = '';
          }
          if (field.extractValue) {
            val = field.extractValue(val);
          }
          return val;
        case 'float':
          return field.default || 0;
        case 'jscode':
        case 'text':
        case 'textarea':
        case 'wysiwyg':
          return field.default || '';
        case 'slider':
        case 'textstyle':
        default:
          Debug.error(`Unknow field type: ${field.type}`);
          return field.default || '';
      }
    }

    function makeFilters(arraySource) {
      if (Array.isArray(arraySource)) {
        return arraySource.map((value) => ({
          key: value.file || '',
          title: value.name,
          children: makeFilters(value.children)
        }));
      }
      return [];
    }

    return Module;
  }
);
