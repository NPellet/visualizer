'use strict';

define([
  'jquery',
  'modules/module',
  'src/util/debug',
  'src/util/util'
], function ($, Module, Debug, Util) {
  let incrementalId = 0;

  let modules = [];
  let definitions = new DataArray();
  let allModules = {};

  function getSubFoldersFrom(folder) {
    return new Promise(function (resolve) {
      const result = {
        folders: {}
      };
      $.getJSON(require.toUrl(`${folder}/folder.json`)).then(function (
        folderContent
      ) {
        result.name = folderContent.name;
        result.modules = folderContent.modules;
        if (
          folderContent.folders &&
                    Array.isArray(folderContent.folders)
        ) {
          const prom = [];
          for (let i = 0; i < folderContent.folders.length; i++) {
            prom.push(
              getSubFoldersFrom(
                `${folder}/${folderContent.folders[i]}`
              )
            );
          }
          Promise.all(prom).then(
            function (results) {
              for (let i = 0; i < results.length; i++) {
                const res = results[i];
                result.folders[res.name] = res;
              }
              resolve(result);
            },
            function (err) {
              Debug.error('Caught error in ModuleFactory', err);
            }
          );
        } else {
          if (typeof folderContent.folders === 'object')
            result.folders = folderContent.folders;
          resolve(result);
        }
      });
    });
  }

  return {
    getTypes() {
      return allModules;
    },

    traverseModules(moduleCallback, obj) {
      obj = obj || allModules;
      if (obj.modules) {
        for (let i = 0; i < obj.modules.length; i++) {
          moduleCallback(obj.modules[i]);
        }
      }
      if (obj.folders) {
        for (const key in obj.folders) {
          this.traverseModules(moduleCallback, obj.folders[key]);
        }
      }
    },
    setModules: function (list) {
      const prom = [];
      if (Array.isArray(list)) {
        throw new Error(
          'Module configuration error : list of folders must be defined in a "folders" array.'
        );
      }

      if (Array.isArray(list.folders)) {
        // folders to retreive
        const finalList = allModules;

        if (list.modules) {
          finalList.modules = list.modules;
        }

        finalList.folders = finalList.folders || {};
        for (let i = 0; i < list.folders.length; i++) {
          if (typeof list.folders[i] === 'object') {
            const folder = list.folders[i];
            $.extend(true, finalList.folders, folder.folders);
          } else {
            // Folder is a string, start recursive lookup
            prom.push(
              getSubFoldersFrom(list.folders[i]).then(
                function (folder) {
                  $.extend(true, finalList, folder);
                  // $.extend(true, allModules, finalList);
                },
                function (err) {
                  Debug.error(
                    'Caught error in ModuleFactory',
                    err
                  );
                }
              )
            );
          }
        }

        allModules = finalList;
      } else {
        allModules = list;
      }
      return Promise.all(prom).then(() => {
        this.traverseModules(function (module) {
          const id = Util.moduleIdFromUrl(module.url);
          if (id) {
            module.id = id;
          }
          module.url = `${module.url.replace(/\/$/, '')}/`;
        });
      });
    },

    newModule(definition) {
      const module = new Module(definition);
      module.setId(++incrementalId);
      modules.push(module);
      definitions.push(definition);
      module.ready.catch(function (e) {
        Debug.error('Initialization of module failed', e);
      });
      return module;
    },

    removeModule(module) {
      modules.splice(modules.indexOf(module), 1);
      definitions.splice(definitions.indexOf(module.definition), 1);
    },

    empty() {
      definitions = new DataArray();
      modules = [];
    },

    getModules() {
      return modules;
    },

    getModule(moduleId) {
      moduleId = Number(moduleId);
      var modules = this.getModules();
      modules = modules.filter(function (m) {
        return Number(m.getId()) === moduleId;
      });
      return modules[0];
    },

    getDefinitions() {
      return definitions;
    },

    getModulesById() {
      const modulesById = {};
      this.traverseModules((mod) => (modulesById[mod.id] = mod));
      return modulesById;
    }
  };
});
