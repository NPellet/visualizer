

CI.EntryPoint = function(structure, data, options, onLoad) {
	
	this.options = options;
	this.onLoad = onLoad;
	
	var entryPoint = this;
	
	
	function init() {
		if(typeof structure == "object")
			doStructure(structure);
		else
			doGetStructure(structure);
	}
	
	function doStructure(structure) {
		
		CI.Grid.init(structure.grid);
		
		entryPoint.structure = structure;
		
		if(!structure.entryPoint) 
			structure.entryPoint = { variables: {} };
		
		if(!structure.modules)
			structure.modules = [];
		
		if(!structure.configuration)
			structure.configuration = {};
		
		if(!structure.configuration.variableFilters)
			structure.configuration.variableFilters = {};


		if(structure.configuration.showMenuBarOnStart)
			$("#ci-expand-left").trigger('click');
			
		$("#ci-header .title").text(structure.configuration.title || 'No title');
			
		entryPoint.entryData = structure.entryPoint;
		
		if(structure.modules !== undefined)
			for(var i = 0; i < structure.modules.length; i++) {
				entryPoint.addModuleFromJSON(structure.modules[i]);
			}
		
		CI.Grid.checkDimensions();
		if(typeof data == "object")
			doData(data);
		else
			doGetData(data);
		
	}
	
	function doGetStructure(structure) {
		jQuery.ajax({
			url: structure,
			data: {},
			type: 'get',
			dataType: 'json',
			success: function(structure) {
				doStructure(structure);
			},
			
			error: function() {
				$("body").unmask().mask("Error while loading structure JSON. Check JSON integrity", { error: true });
			}
		});
	}
	
	function doData(page) {
		entryPoint.loaded(page);
	}
	
	function doGetData(data) {
		jQuery.ajax({
			url: data,
			data: {},
			type: 'get',
			dataType: 'text',
			success: function(data) {
				$("body").unmask().mask("Parsing data...", { error: true });
				CI.WebWorker.send('jsonparser', data, function(data) {
					$("body").unmask();
					doData(data);	
				});
			},
			
			error: function() {
				$("body").unmask().mask("Error while loading data JSON. Check JSON integrity", { error: true });				
			}
		});
	}
	
	init();
}


CI.EntryPoint.prototype = {

	loaded: function(data, doNotCallback) {
		
		this.data = data;
	
		if(this.entryData && this.entryData.variables) {
		
			var vars = this.entryData.variables;
			if(!vars)
				return;
			


			for(var i in this.data) {
			//	CI.dataType.instanciate(this.data[i]);
				for(var j = 0; j < vars.length; j++) {
					if(vars[j].sourcename == i)
						CI.API.setSharedVarFromJPath(vars[j].varname, this.data[i], vars[j].jpath);
				}
			}
		}
		
		if(doNotCallback)
			return;
			
		if(typeof this.onLoad == 'function')
			this.onLoad(this, this.data);
	},
	
	getEntryDataVariables: function() {
		
		
		return this.entryData.variables;		
		
	},
	
	setEntryDataVariables: function(vars) {
		this.entryData.variables = vars;
		this.loaded(this.data, false);
	},
	
	save: function() {
		console.info('Method will soon be removed. Please call Saver.doSave(); directly');
		Saver.doSave();	
	},
	
	getDataFromSource: function(child) {
		
		if(!child)
			return this.data;
		else
			return this.data[child];
	},
	
	addModuleFromJSON: function(json, addToDefinition) {
		if(addToDefinition) {
			this.structure.modules.push(json);
		}
		var Module = new CI.Module(json);
		this.addModule(Module); 
	},
	
	addModule: function(Module) {
		CI.modules[Module.getId()] = Module;
		CI.Grid.addModule(Module);
	},
	
	removeModule: function(Module) {
		for(var i = 0; i < this.structure.modules.length; i++) {
			if(Module.getDefinition() == this.structure.modules[i]) {
				this.structure.modules.splice(i, 1);
				break;
			}
		}
		CI.Grid.removeModule(Module);
	},
	
	getConfiguration: function() {
		
		if(!this.structure.configuration)
			this.structure.configuration = {};
			
		return this.structure.configuration;
	},
	
	setConfiguration: function(cfg) {
		return this.structure.configuration = cfg;
	}
}