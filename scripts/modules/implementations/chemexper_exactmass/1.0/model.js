 /*
 * model.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */


if(typeof CI.Module.prototype._types.chemexper_exactmass == 'undefined')
	CI.Module.prototype._types.chemexper_exactmass = {};

CI.Module.prototype._types.chemexper_exactmass.Model = function(module) {
	
	/*
	 * Sets
	 * (array) this.data
	 * (json) this.dataValue    -- Could be any type of data provided by any DataSource object. 
	 */
	CI.Module.prototype._impl.model.init(module, this);
	
	// Call anything else if you want. The prototyped init() function can also be used.
}

CI.Module.prototype._types.chemexper_exactmass.Model.prototype = {
	
	
	// Usually you don't really to init a model. But who knows. Please leave it.
	init: function() {	
	//	CI.Module.prototype._impl.model.afterInit(this.module);
	},
	
	
	/* 
	 * This function is a handler called from any DataSource object. 
	 * Its goal is to refresh the module with the new data
	 * 
	 * To finally refresh the view, simply call this.module.updateView();
	 * or don't if for any reason it's not necessary to update the module
	 */
	onDataChange: function(dataName) {
		
		/* Here you can transform the data coming from the DAO */
		this.dataValue[dataName] = this.data[dataName].getData();
		
		// Ok so here the value is a number, like 300.0303, stored in an array.
		// We have to take this mass, and make a ChemExper query.
		
		// So first, we get the rel corresponding to this dataname
		// It may be "exactmass" or "majormass" and will influence the query
		var rel = this.module.getDataRelFromName(dataName);
		
		var url = "http://www.chemexper.com/search/reference/json2/";
		switch(rel) {
			
			case 'exactmass':
				url += 'exactMass';
			break;
			
			case 'majormass':
				url += 'exatMassMajor';
			break;
		}
		
		url += "/" + this.dataValue[dataName];
		url += "/0.5";
		
		
		/* Triggers a module update */
		this.module.updateView({
			"looking": true,
			"mass": this.dataValue[dataName],
			"varname": dataName,
			"mode": rel
		});
		var mass = this.dataValue[dataName];
		var inst = this;	
		$.getJSON(url, {}, function(data) {
			
			/* Triggers a module update */
			inst.module.updateView({
				"looking": false,
				"number": data.totalFound,
				"mass": mass,
				"varname": dataName,
				"mode": rel
			});
			
			inst.dataValue[dataName] = data;
			inst.data[dataName].forceSetData(data);
			CI.dataType.instanciate(data);
			if(inst._callbacks) {
				for(var k = 0; k < inst._callbacks.length; k++) {
					inst._callbacks[k](data);
				}
			}
		});
		
		
	},
	
	getValue: function() {
		return this.dataValue;
	},
	
	
	getjPath: function(rel) {
		
		var data = this.module.getData();
		if(!data)
			return;
		
		var jpaths = {};
		for(var i in data) {
			switch(rel) {
				case 'list':
					//for(var j = 0; j < data[i].data.entry.length; j++)
						CI.Types._getjPath(data[i].data, jpaths);
				break;
				case 'best':
					CI.Types._getjPath(data[i].data.entry[0], jpaths);			
				break;
			}
		}
		return jpaths;
	}
}
