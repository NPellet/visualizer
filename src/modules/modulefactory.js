'use strict';

define(['jquery', 'modules/module', 'src/util/debug'], function ($, Module, Debug) {

    var incrementalId = 0;

    var modules = [],
        definitions = new DataArray(),
        allModules;

    function getSubFoldersFrom(folder) {
        return new Promise(function (resolve) {
            var result = {
                folders: {}
            };
            $.getJSON(require.toUrl(folder + '/folder.json')).then(function (folderContent) {
                result.name = folderContent.name;
                result.modules = folderContent.modules;
                if (folderContent.folders && Array.isArray(folderContent.folders)) {
                    var defs = [];
                    for (var i = 0; i < folderContent.folders.length; i++) {
                        defs.push(getSubFoldersFrom(folder + '/' + folderContent.folders[i]));
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
        setModules: function (list) {

            if (Array.isArray(list)) {
                throw new Error('Module configuration error : list of folders must be defined in a "folders" array.');
            }

            if (Array.isArray(list.folders)) { // folders to retreive
                var finalList = {};

                if (list.modules) {
                    finalList.modules = list.modules;
                }

                finalList.folders = {};
                for (var i = 0; i < list.folders.length; i++) {
                    if (typeof list.folders[i] === 'object') {
                        var folder = list.folders[i];
                        $.extend(true, finalList.folders, folder.folders);

                    } else { // Folder is a string, start recursive lookup
                        getSubFoldersFrom(list.folders[i]).then(function (folder) {
                            $.extend(true, finalList, folder);
                        }, function (err) {
                            Debug.error('Caught error in ModuleFactory', err);
                        });
                    }
                }

                allModules = finalList;
            }

            else {
                allModules = list;
            }

        },
        newModule: function (definition) {
            var module = new Module(definition);
            module.setId(++incrementalId);
            modules.push(module);
            definitions.push(definition);

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