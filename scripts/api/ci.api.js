 /*
 * ci.api.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


/**
 * Represents the source of any type of data (i.e. is updatable through e.g. ajax)
 * @namespace 
 */
CI.API = {};

CI.API.blankSharedVar = function(varName) {
	CI.sharedData[varName] = null;
	$(document).trigger('sharedDataChanged', [varName]);
}

CI.API.getSharedVar = function(varName) {	
	return CI.sharedData[varName];
}

CI.API.getModulesFromSharedVar = function(varName) {
	console.error("Function deprecated");
	var allModules = {}, source = [];
	for(var i in CI.modules) {
		source = CI.modules[i].definition.dataSource;
	
		for(var j = 0; j < source.length; j++) {
			if(source[j].name == varName) {
				allModules[i] = CI.modules[i];
				break;
			}
		}
	}
	return allModules;
}


CI.API.resendAllVars = function() {
	CI.Repo.resendAll();
}


CI.API.setSharedVarFromJPath = function(name, value, jpath) {
	CI.DataType.getValueFromJPath(value, jpath).done(function(returned) {
		CI.Repo.set(name, returned);

	});
}

CI.API.getAllSharedVariables = function() {

	var allSharedVars = {};

	var entryVars = Entry.getEntryDataVariables();
	console.log(entryVars);
	for(var i in entryVars) {
		if(typeof allSharedVars[entryVars[i].varname] == "undefined")
			allSharedVars[entryVars[i].varname] = {send: [], receive: []};
			allSharedVars[entryVars[i].varname].send.push({
				rel: '',
				moduleName: ''
			});
	}
			
	for(var i in CI.modules) {

		var def = CI.modules[i].definition;

		for(var j = 0; def.dataSource && j < def.dataSource.length; j++) {
			var source = def.dataSource[j];
			if(source.name == "")
				continue;
	
			if(typeof allSharedVars[source.name] == "undefined")
				allSharedVars[source.name] = {send: [], receive: []};
			
			allSharedVars[source.name].receive.push({
				rel: source.rel,
				moduleName: def.title
			});
		}
		
		for(var j = 0; def.dataSend && j < def.dataSend.length; j++) {
			
			if(def.dataSend[j].name == "")
				continue;
	
			if(typeof allSharedVars[def.dataSend[j].name] == "undefined")
				allSharedVars[def.dataSend[j].name] = {send: [], receive: []};
				
			allSharedVars[def.dataSend[j].name].send.push({
				rel: def.dataSend[j].rel,
				moduleName: def.title
			});
		}
	}

	return allSharedVars;
}

CI.API.getSharedFilters = function(varName) {
	var filters = Entry.getConfiguration().variableFilters;
	var toReturn = [];
	if(filters[varName]) {
		var filters = filters[varName];
		for(var i = 0; i < filters.length; i++)
			if(CI.VariableFilters[filters[i]])
				toReturn.push(CI.VariableFilters[filters[i]].process);
	}
	return toReturn;
}

CI.API.doHighlight = function(tagList) {

}

