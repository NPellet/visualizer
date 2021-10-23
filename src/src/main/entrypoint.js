'use strict';

define([
  'jquery',
  'lodash',
  'src/header/header',
  'src/util/repository',
  'src/main/grid',
  'src/util/api',
  'src/util/context',
  'src/util/datatraversing',
  'src/util/versioning',
  'modules/modulefactory',
  'src/util/viewmigration',
  'src/util/actionmanager',
  'src/util/debug',
  'src/util/browser',
  'src/util/util',
  'src/util/urldata',
  'src/util/ui',
  'src/util/config',
  'src/util/sandbox',
  'src/util/shortcuts',
  'src/util/copyPasteManager',
  './forceLoad'
], function (
  $,
  _,
  Header,
  Repository,
  Grid,
  API,
  Context,
  Traversing,
  Versioning,
  ModuleFactory,
  Migration,
  ActionManager,
  Debug,
  browser,
  Util,
  UrlData,
  ui,
  Config,
  Sandbox
) {
  var _viewLoaded, _dataLoaded, _modulesSet;

  var RepositoryData = new Repository(),
    RepositoryHighlight = new Repository(),
    RepositoryActions = new Repository({ doNotSave: true });

  API.setRepositoryData(RepositoryData);
  API.setRepositoryHighlights(RepositoryHighlight);
  API.setRepositoryActions(RepositoryActions);

  function doView(view) {
    DataObject.recursiveTransform(view, false);

    view = Migration(view);
    view.grid = view.grid || new DataObject();

    if (this.viewLoaded) {
      reloadingView();
      Grid.reset(view.grid);
    } else {
      Grid.init(view.grid, document.getElementById('modules-grid'));
      this.viewLoaded = true;
    }

    ModuleFactory.empty();

    view.modules = view.modules || new DataArray();

    var l = view.modules.length;

    view.variables = view.variables || new DataArray();
    view.aliases = view.aliases || new DataArray();
    view.configuration = view.configuration || new DataObject();
    view.configuration.title = view.configuration.title || 'No title';

    for (var i = 0; i < l; i++) {
      Grid.addModuleFromJSON(view.getChildSync(['modules', i], true));
    }

    Grid.checkDimensions();
    view.modules = ModuleFactory.getDefinitions();
    viewLoaded();
  }

  function reloadingView() {
    // Grid is automatically emptied
    RepositoryData.resetCallbacks();
    RepositoryActions.resetCallbacks();
  }

  function doData(data, reloading) {
    if (reloading) {
      reloadingData();
    }

    dataLoaded();
  }

  function reloadingData() {
    RepositoryData.resetVariables();
    RepositoryActions.resetVariables();
    RepositoryHighlight.resetCallbacks();
    RepositoryHighlight.resetVariables();
  }

  function viewLoaded() {
    _viewLoaded = true;
    _check('view');
  }

  function dataLoaded() {
    _dataLoaded = true;
    _check('data');
  }

  function _check(loading) {
    if (!_dataLoaded || !_viewLoaded) {
      return;
    }

    var view = Versioning.getView();
    var data = Versioning.getData();

    Promise.all([
      loadCustomFilters(),
      loadMainVariables(),
      configureRequirejs(),
      loadCustomModules()
    ])
      .then(doInitScript)
      .then(
        function () {
          ActionManager.viewHasChanged(view);
          ModuleFactory.getModules().forEach(function (module) {
            if (
              module.controller &&
              typeof module.controller.onGlobalPreferenceChange === 'function'
            ) {
              module.controller.onGlobalPreferenceChange();
            }
            module.resolveGlobal();
          });
          _modulesSet.then(checkCustomModules, checkCustomModules);
        },
        function (e) {
          Debug.error('View loading problem', e, e.stack);
        }
      );


    function doInitScript() {
      if (view.init_script) {
        const sandbox = new Sandbox();
        sandbox.setContext({ API });
        const prefix = '(async function init_script(){"use strict";\n';
        const script = view.init_script[0].groups.general[0].script[0] || '';
        const suffix = '\n});';
        const func = sandbox.run(prefix + script + suffix, 'init_script');
        return func();
      }
    }

    function configureRequirejs() {
      if (!view.aliases) return;
      var paths = view.aliases;

      paths = _.filter(paths, function (p) {
        return p && p.alias && p.path;
      });
      var conf = { paths: {} };
      for (var i = 0; i < paths.length; i++) {
        conf.paths[paths[i].alias] = paths[i].path;
      }
      for (var key in conf.paths) {
        require.undef(key);
      }
      require.config(DataObject.resurrect(conf));
    }

    function checkCustomModules() {
      var v = Versioning.getView().duplicate();
      var changed = false;
      var modulesById = ModuleFactory.getModulesById();
      for (var j = 0; j < v.modules.length; j++) {
        var moduleId = Util.moduleIdFromUrl(v.modules[j].url);
        var module = modulesById[moduleId];
        if (!module) {
          Debug.warn(
            `Your view contains an url to a module (id: ${moduleId}) that does not correspond to any loaded modules`
          );
          continue;
        }
        if (
          module.url.replace(/\/$/, '') !== v.modules[j].url.replace(/\/$/, '')
        ) {
          changed = true;
          v.modules[j].url = module.url;
        }
      }
      if (changed) {
        Versioning.setViewJSON(v);
      }
    }

    function loadCustomModules() {
      var modules = view.getChildSync([
        'custom_filters',
        0,
        'sections',
        'modules',
        0,
        'groups',
        'modules',
        0
      ]);
      if (!modules) return Promise.resolve();
      modules = _.filter(modules, function (m) {
        return m && m.url;
      });
      for (var i = 0; i < modules.length; i++) {
        modules[i].url = modules[i].url.replace(/\/$/, '');
      }
      return ModuleFactory.setModules({
        folders: _.map(modules, 'url')
      });
    }

    function loadCustomFilters() {
      // Load custom filters
      if (view.custom_filters) {
        var filters = view.custom_filters[0].sections.filters,
          allFilters = API.getAllFilters();
        for (var i = 0; i < filters.length; i++) {
          var filter = filters[i].groups.filter[0];
          if (filter.name[0]) {
            var deps = filters[i].groups.libs[0],
              depsA = ['src/util/api'],
              defineStr = 'filterDef = function filterDefinition(API',
              dep;
            for (var j = 0; j < deps.length; j++) {
              dep = deps[j];
              if (dep.lib) {
                depsA.push(dep.lib);
                defineStr += `, ${dep.alias}`;
              }
            }
            defineStr += `) { \n ${filter.script[0]} \n}`;

            try {
              var filterDef;
              eval(defineStr);
              require.undef(filter.name[0]);
              define(filter.name[0], depsA, filterDef);
              allFilters.push({
                file: filter.name[0],
                name: filter.name[0]
              });
            } catch (e) {
              Debug.warn('Problem with custom filter definition', e);
            }
          }
        }
        var filtersLib = view.getChildSync(
          'custom_filters',
          0,
          'sections',
          'filtersLib',
          0,
          'groups',
          'filters',
          0
        );
        if (filtersLib) {
          filtersLib = _.filter(filtersLib, function (v) {
            return v && v.name && v.file;
          });
          API.setAllFilters(filtersLib);
        }
      }
    }

    function loadMainVariables() {
      // If no variable is defined in the view, we start browsing the data and add all the first level
      if (view.variables.length === 0) {
        for (var i in data) {
          if (i.charAt(0) === '_') {
            continue;
          }

          view.variables.push(new DataObject({ varname: i, jpath: [i] }));
        }
      }

      // Entry point variables
      API.loading('Fetching remote variables');
      var fetching = [];
      for (var i = 0, l = view.variables.length; i < l; i++) {
        (function (i) {
          var entryVar = view.traceSync(['variables', i]);
          if (entryVar.varname) {
            // Defined by an URL
            if (entryVar.url) {
              fetching.push(
                UrlData.get(entryVar.url, entryVar.timeout | 0, {
                  Accept: 'application/json'
                }).then(function (v) {
                  var varname = entryVar.varname;
                  data.setChild([varname], v, true);
                  return API.setVariable(varname, false, [varname]);
                })
              );
            } else if (!entryVar.jpath) {
              // If there is no jpath, we assume the variable is an object and we add it in the data stack
              // Note: if that's not an object, we will have a problem...
              fetching.push(API.createData(name, false));
            } else {
              if (typeof entryVar.jpath === 'string') {
                entryVar.jpath = entryVar.jpath.split('.');
                entryVar.jpath.shift();
              }

              fetching.push(
                API.setVariable(entryVar.varname, false, entryVar.jpath)
              );
            }
          }
        })(i);
      }

      return Promise.all(fetching).then(function () {
        API.stopLoading('Fetching remote variables');
      });
    }
  }

  function configureEntryPoint() {
    var data = Versioning.getData(),
      view = Versioning.getView();

    var div = ui.dialog({
      autoPosition: true,
      width: '80%',
      noHeader: true
    });

    var options = [];

    Traversing.getJPathsFromElement(data, options);

    require(['forms/form'], function (Form) {
      var form = new Form();

      form.init({
        onValueChanged: function (value) {}
      });

      form.setStructure({
        sections: {
          cfg: {
            options: {
              title: 'General configuration',
              icon: 'hostname'
            },
            groups: {
              tablevars: {
                options: {
                  type: 'table',
                  title: 'Main variables',
                  multiple: true
                },
                fields: {
                  varname: {
                    type: 'text',
                    multiple: false,
                    title: 'Variable name'
                  },
                  jpath: {
                    type: 'combo',
                    title: 'J-Path',
                    options: options,
                    extractValue: function (val) {
                      if (val) {
                        var val2 = val.split('.');
                        val2.shift();
                        return val2;
                      }
                    },

                    insertValue: function (val) {
                      return `element.${(val || []).join('.')}`;
                    }
                  },
                  url: {
                    type: 'text',
                    title: 'From URL'
                  },
                  timeout: {
                    type: 'text',
                    title: 'Timeout'
                  }
                }
              },
              aliases: {
                options: {
                  type: 'table',
                  multiple: true,
                  title: 'Define Global Aliases'
                },
                fields: {
                  path: {
                    type: 'text',
                    title: 'Url or Path (omit .js extension)'
                  },
                  alias: {
                    type: 'text',
                    title: 'Alias'
                  }
                }
              }
            }
          },
          actionscripts: {
            options: {
              title: 'Action scripting',
              icon: 'script_go'
            },
            sections: {
              actions: {
                options: {
                  multiple: true,
                  title: 'Action'
                },
                groups: {
                  action: {
                    options: {
                      type: 'list'
                    },
                    fields: {
                      name: {
                        type: 'text',
                        title: 'Action name'
                      },
                      script: {
                        type: 'jscode',
                        title: 'Script'
                      }
                    }
                  }
                }
              }
            }
          },
          actionfiles: {
            options: {
              title: 'Action files',
              icon: 'server_go'
            },
            groups: {
              action: {
                options: {
                  type: 'table',
                  multiple: true
                },
                fields: {
                  name: {
                    type: 'text',
                    title: 'Action name'
                  },
                  file: {
                    type: 'text',
                    title: 'File'
                  },
                  mode: {
                    type: 'combo',
                    title: 'File type',
                    options: [
                      { key: 'worker', title: 'WebWorker' },
                      {
                        key: 'amd',
                        title: 'Asynchronously loaded module'
                      }
                    ]
                  }
                }
              }
            }
          },
          custom_filters: {
            options: {
              title: 'Custom filters',
              icon: 'script_go'
            },
            sections: {
              modules: {
                options: {
                  multiple: false,
                  title: 'Modules'
                },
                groups: {
                  modules: {
                    options: {
                      type: 'table',
                      multiple: true
                    },
                    fields: {
                      url: {
                        type: 'text',
                        title: 'Root url to modules'
                      }
                    }
                  }
                }
              },
              filtersLib: {
                options: {
                  title: 'Filters'
                },
                groups: {
                  filters: {
                    options: {
                      type: 'table',
                      multiple: true
                    },
                    fields: {
                      name: {
                        type: 'text',
                        title: 'Name'
                      },
                      file: {
                        type: 'text',
                        title: 'url'
                      }
                    }
                  }
                }
              },
              filters: {
                options: {
                  multiple: true,
                  title: 'Custom Filters'
                },
                groups: {
                  filter: {
                    options: {
                      type: 'list'
                    },
                    fields: {
                      name: {
                        type: 'text',
                        title: 'Filter name'
                      },
                      script: {
                        type: 'jscode',
                        title: 'Script'
                      }
                    }
                  },
                  libs: {
                    options: {
                      type: 'table',
                      multiple: 'true',
                      title: 'Dependencies'
                    },
                    fields: {
                      lib: {
                        type: 'text',
                        title: 'URL'
                      },
                      alias: {
                        type: 'text',
                        title: 'Alias'
                      }
                    }
                  }
                }
              }
            }
          },
          init_script: {
            options: {
              title: 'Initialization script',
              icon: 'scripts'
            },
            groups: {
              general: {
                options: {
                  type: 'list',
                  multiple: true
                },
                fields: {
                  script: {
                    type: 'jscode',
                    title: 'Javascript to execute'
                  }
                }
              }
            }
          }
        }
      });

      form.onStructureLoaded().done(function () {
        form.fill({
          sections: {
            cfg: [
              {
                groups: {
                  tablevars: [view.variables],
                  aliases: [view.aliases]
                }
              }
            ],
            actionscripts: [
              {
                sections: {
                  actions: ActionManager.getScriptsForm()
                }
              }
            ],
            init_script: view.init_script,
            custom_filters: view.custom_filters,
            actionfiles: ActionManager.getFilesForm(),
            requirejs: view.requirejs
          }
        });
      });

      form.addButton('Cancel', { color: 'blue' }, function () {
        div.dialog('close');
      });

      form.addButton('Save', { color: 'green' }, function () {
        div.dialog('close');

        var data,
          value = form.getValue();

        /* Entry variables */
        data = new DataArray(value.sections.cfg[0].groups.tablevars[0], true);

        view.variables = data;
        view.aliases = new DataArray(
          value.sections.cfg[0].groups.aliases[0],
          true
        );
        view.init_script = value.sections.init_script;
        view.custom_filters = value.sections.custom_filters;
        view.requirejs = value.sections.requirejs;

        _check(true);

        /* Handle actions scripts */
        data = value.sections.actionscripts[0].sections.actions;
        ActionManager.setScriptsFromForm(data);
        /* */

        /* Handle actions files */
        data = value.sections.actionfiles;
        ActionManager.setFilesFromForm(data);
        /* */
      });

      form.onLoaded().done(function () {
        div.html(form.makeDom());
        form.inDom();
      });
    });
  }

  return {
    init: function (urls, type) {
      // Check that browser is compatible
      // if(!browser.checkBrowser()) {
      //      $('#ci-visualizer').append('<div id="browser-compatibility">' + browser.errorMessage() + '</div>');
      //      return;
      //  }

      var css = [
        'css/main.css',
        'components/colors/css/colors.min.css',
        'components/jquery-ui/themes/base/jquery-ui.min.css',
        'lib/forms/style.css',
        'components/fancytree/dist/skin-lion/ui.fancytree.css',
        'css/overwrite_styles.css',
        'node_modules/@fortawesome/fontawesome-free/css/all.min.css'
      ];

      css.forEach(function (css) {
        Util.loadCss(css);
      });

      var debugSet;
      if (urls.debug) {
        Debug.setDebugLevel(parseInt(urls.debug, 10));
        debugSet = true;
      }

      if (urls.lockView) {
        API.viewLock();
      }

      browser.checkCompatibility().then(doInit);

      // Sets the header
      function doInit(errorMessage) {
        var visualizerDiv = $('#ci-visualizer');

        if (errorMessage) {
          visualizerDiv.append(
            `<div id="browser-compatibility">${errorMessage}</div>`
          );
          return;
        }

        visualizerDiv.html(
          '<table id="viewport" cellpadding="0" cellspacing="0">\n    <tr>\n        <td id="ci-center">\n            <div id="modules-grid">\n                <div id="ci-dialog"></div>\n            </div>\n        </td>\n    </tr>\n</table>'
        );

        var configJson = urls.config || visualizerDiv.attr('data-ci-config');
        if (!configJson) {
          if (visualizerDiv.attr('config')) {
            Debug.warn(
              'config as attribute of ci-visualizer is deprecated. Use data-ci-config instead.'
            );
            configJson = visualizerDiv.attr('config');
          } else {
            configJson = require.toUrl('usr/config/default.json');
          }
        }

        $.getJSON(configJson, {}, function (cfgJson) {
          if (cfgJson.usrDir) {
            require.config({
              paths: {
                usr: cfgJson.usrDir
              }
            });
          }

          if (!debugSet) {
            Debug.setDebugLevel(cfgJson.debugLevel || Debug.Levels.ERROR);
          }

          Config.setConfig(cfgJson);

          if (cfgJson.lockView || cfgJson.viewLock) {
            Versioning.viewLock();
          }

          if (cfgJson.header) {
            Header.init(cfgJson.header);
          }

          if (cfgJson.modules) {
            _modulesSet = ModuleFactory.setModules(cfgJson.modules);
          }

          // Set the filters
          API.setAllFilters(cfgJson.filters || []);
        })
          .fail(function (a, b) {
            Debug.error(`Error loading the config : ${b}`);
          })
          .always(function () {
            require(['usr/datastructures/filelist'], function () {
              Context.init(document.getElementById('modules-grid'));
              if (!Versioning.isViewLocked()) {
                Context.listen(Context.getRootDom(), [
                  [
                    '<li class="ci-item-configureentrypoint"><a><span class="ui-icon ui-icon-key"></span>Global preferences</a></li>',
                    function () {
                      configureEntryPoint();
                    }
                  ]
                ]);
                Context.listen(Context.getRootDom(), [
                  [
                    '<li class="ci-item-refresh" name="refresh"><a><span class="ui-icon ui-icon-arrowrefresh-1-s"></span>Refresh page</a></li>',
                    function () {
                      document.location.reload();
                    }
                  ]
                ]);
              }

              Versioning.setViewLoadCallback(doView);
              Versioning.setDataLoadCallback(doData);

              Versioning.setViewJSON({});
              Versioning.setDataJSON({});

              Versioning.setURLType(type);
              var $visualizer = $('#ci-visualizer');

              var viewURL = urls.viewURL || $visualizer.attr('data-ci-view');
              if (!viewURL && $visualizer.attr('viewURL')) {
                Debug.warn(
                  'viewURL as attribute of ci-visualizer is deprecated. Use data-ci-view instead.'
                );
                viewURL = $visualizer.attr('viewURL');
              }

              var dataURL = urls.dataURL || $visualizer.attr('data-ci-data');
              if (!dataURL && $visualizer.attr('dataURL')) {
                Debug.warn(
                  'dataURL as attribute of ci-visualizer is deprecated. Use data-ci-data instead.'
                );
                dataURL = $visualizer.attr('dataURL');
              }

              var viewInfo = {
                view: {
                  urls: urls.views,
                  branch: urls.viewBranch,
                  url: viewURL
                },
                data: {
                  urls: urls.results,
                  branch: urls.resultBranch,
                  url: dataURL
                }
              };
              window.history.replaceState(
                { type: 'viewchange', value: viewInfo },
                ''
              );
              Versioning.switchView(viewInfo, false);
            });
          });
      }
    }
  };
});
