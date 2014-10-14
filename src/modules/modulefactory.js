'use strict';

define(['jquery', 'modules/module', 'src/util/debug'], function($, Module, Debug) {

	var incrementalId = 0;

	var modules = [],
			definitions = new DataArray(),
			modulesDeferred = [],
			allModules;


	function oldGetSubFoldersFrom(folder) {
		return $.getJSON(require.toUrl(folder), {}).pipe(function(data) {
			return getModules(data);
		});
	}

	function getModules(folderInfo) {

		var defs = [];

		for(var i in folderInfo.folders) {
			(function(j) {

				if (typeof folderInfo.folders[ j ] === "object") {
					var folder = folderInfo.folders[ j ];
					delete folderInfo.folders[ j ];
					folderInfo.folders[ folder.name || j ] = folder;

				} else {
					defs.push(oldGetSubFoldersFrom(folderInfo.folders[ j ] + "folder.json").done(function(folder) {
						delete folderInfo.folders[ j ];
						folderInfo.folders[ folder.name ] = folder;
					}));
				}

			})(i);
		}

		return $.when.apply($, defs).pipe(function() {
			return folderInfo;
		});
	}
	function getSubFoldersFrom(folder){
		return new Promise(function(resolve){
			var result = {
				folders:{}
			};
			$.getJSON(require.toUrl(folder+"/folder.json")).then(function(folderContent){
				result.name = folderContent.name;
				result.modules = folderContent.modules;
				if(folderContent.folders && (folderContent.folders instanceof Array)) {
					var defs = [];
					for(var i = 0; i < folderContent.folders.length; i++) {
						defs.push(getSubFoldersFrom(folder+"/"+folderContent.folders[i]));
					}
					Promise.all(defs).then(function(results){
						for(var i = 0; i < results.length; i++) {
							var res = results[i];
							result.folders[res.name] = res;
						}
						resolve(result);
					}, function(err){
						Debug.error("Caught error in ModuleFactory", err);
					});
				}
				else {
					if(typeof folderContent.folders === "object")
						result.folders = folderContent.folders;
					resolve(result);
				}
			});
		});
	}

	return {
		getTypes: function() {
			return $.when.apply($, modulesDeferred).pipe(function() {
				return allModules;
			});
		},
		setModules: function(list) {

			if (list instanceof Array) { // backwards compatibility
				return this.oldSetModules(list);
			}

			if (list.folders instanceof Array) { // folders to retreive
				var finalList = {};

				if (list.modules) {
					finalList.modules = list.modules;
				}

				finalList.folders = {};
				for (var i = 0; i < list.folders.length; i++) {
					if (typeof list.folders[ i ] === "object") {
						var folder = list.folders[ i ];
						$.extend(true, finalList.folders, folder.folders);

					} else { // Folder is a string, start recursive lookup
						getSubFoldersFrom(list.folders[ i ]).then(function(folder) {
							$.extend(true, finalList, folder);
						}, function(err) {
							Debug.error("Caught error in ModuleFactory", err);
						});
					}
				}

				allModules = finalList;
			}

			else {
				allModules = list;
			}

		},
		oldSetModules: function(list) {

			var i = 0,
					l;

			if (!(list instanceof Array)) {
				allModules = list;
				return;
			}

			l = list.length;
			var finalList = {};

			for (; i < l; i++) {

				if (typeof list[ i ] === "string") { // url

					(function(j) {
						oldGetSubFoldersFrom(list[ j ]).then(function(data) {
							$.extend(true, finalList, data);
						});
					})(i);

				} else { // It's a folder type structure
					getModules(list[ i ]).then(function(data) {
						$.extend(true, finalList, data);
					});
				}
			}
			
			allModules = finalList;
			
		},
		newModule: function(definition) {

			var module = new Module(definition);
			module.setId(++incrementalId);
			modules.push(module);
			definitions.push(definition);

			return module;
		},
		removeModule: function(module) {
			modules.splice(modules.indexOf(module), 1);
			definitions.splice(definitions.indexOf(module.definition), 1);
		},
		empty: function() {
			definitions = new DataArray();
			modules = [];
		},
		getModules: function() {
			return modules;
		},
		getDefinitions: function() {
			return definitions;
		}
	};
});
