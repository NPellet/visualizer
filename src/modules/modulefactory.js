'use strict';

define(['jquery', 'modules/module', 'src/util/debug'], function ($, Module, Debug) {

    var incrementalId = 0;

    var modules = [],
        definitions = new DataArray(),
        allModules = {};

    function getSubFoldersFrom(folder, prop) {
        return new Promise(function (resolve) {
            var result = {
                folders: {}
            };
            console.log(folder);
            $.getJSON(require.toUrl(folder + '/folder.json')).then(function (folderContent) {
                result.name = folderContent.name;
                result.modules = folderContent.modules;
                if(result.modules.length > 0 && prop) {
                    for(var j=0; j<result.modules.length; j++) {
                        $.extend(result.modules[j], prop);
                        if(result.modules[j].folder) {
                            result.modules[j].folder = folder + '/' + result.modules[j].folder
                        }
                    }
                }
                if (folderContent.folders && Array.isArray(folderContent.folders)) {
                    var defs = [];
                    for (var i = 0; i < folderContent.folders.length; i++) {
                        defs.push(getSubFoldersFrom(folder + '/' + folderContent.folders[i], prop));
                    }
                    Promise.all(defs).then(function (results) {
                        for (var i = 0; i < results.length; i++) {
                            var res = results[i];
                            result.folders[res.name] = res;
                        }
                        resolve(result);
                    }, function (err) {
                        Debug.error('Caught error in ModuleFactory', err);
                    });
                }
                else {
                    if (typeof folderContent.folders === 'object')
                        result.folders = folderContent.folders;
                    resolve(result);
                }
            });
        });
    }

    return {
        getTypes: function () {
            return allModules;
        },
        resolveModuleUrl: function(moduleId, moduleUrl) {
            this.traverseModules(function(module) {
                if(module.id === moduleId) {
                    module.url = moduleUrl.replace(/\/$/, '') + '/';
                }
            })
        },

        traverseModules: function(moduleCallback, obj) {
            obj = obj || allModules;
            var i;
            if(obj.modules) {
                for(i=0; i<obj.modules.length; i++) {
                    moduleCallback(obj.modules[i]);
                }
            }
            if(obj.folders) {
                for(var key in obj.folders) {
                    this.traverseModules(moduleCallback, obj.folders[key]);
                }
            }
        },
        setModules: function (list, prop) {
            var prom = [];
            if (Array.isArray(list)) {
                throw new Error('Module configuration error : list of folders must be defined in a "folders" array.');
            }

            if (Array.isArray(list.folders)) { // folders to retreive
                var finalList = allModules;

                if (list.modules) {
                    finalList.modules = list.modules;
                }

                finalList.folders = finalList.folders || {};
                for (var i = 0; i < list.folders.length; i++) {
                    if (typeof list.folders[i] === 'object') {
                        var folder = list.folders[i];
                        $.extend(true, finalList.folders, folder.folders);

                    } else { // Folder is a string, start recursive lookup
                        prom.push(getSubFoldersFrom(list.folders[i], prop).then(function (folder) {
                            $.extend(true, finalList, folder);
                            //$.extend(true, allModules, finalList);
                        }, function (err) {
                            Debug.error('Caught error in ModuleFactory', err);
                        }));
                    }
                }

                allModules = finalList;
            }

            else {
                allModules = list;
            }
            return Promise.all(prom);

        },
        newModule: function (definition) {
            var module = new Module(definition);
            module.setId(++incrementalId);
            modules.push(module);
            definitions.push(definition);
            module.ready.catch(function() {
                Debug.error('Initialization of module failed');
            });
            return module;
        },
        removeModule: function (module) {
            modules.splice(modules.indexOf(module), 1);
            definitions.splice(definitions.indexOf(module.definition), 1);
        },
        empty: function () {
            definitions = new DataArray();
            modules = [];
        },
        getModules: function () {
            return modules;
        },
        getDefinitions: function () {
            return definitions;
        }
    };
});