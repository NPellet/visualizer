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

