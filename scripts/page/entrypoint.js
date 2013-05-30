

CI.EntryPoint = function(options, onLoad) {
	
	this.options = options;
	this.onLoad = onLoad;
	this.data = {};

	var entryPoint = this;
	this.entryData = {};
	
	function pad(val) {
		return val < 10 ? '0' + val : val;
	}

	function init() {


		CI.Repo = new CI.RepoPool();
		CI.RepoHighlight = new CI.RepoPool();
		CI.Actions = new CI.RepoPool();

		CI.URLs = {};
		var urlStructure = window.document.location.search.substring(1).split('&');
		for(var i = 0; i < urlStructure.length; i++) {
			var args = urlStructure[i].split('=');
			var val = unescape(args[1]);
			CI.URLs[args[0]] = val;
		}

		buttons = { view: {}, data: {}};
		var pos = ['view', 'data'];
		var pos2 = ['View', 'Data']

		for(var i = 0; i < pos.length; i++) {

			(function(j) {
				
				buttons[pos[j]].copyToLocal = new BI.Buttons.Button('Copy to local', function() {
					// Make here dialog
					CI[pos2[j]].serverCopy((j == 0 ? Entry.structure : Entry.data));
				}, { color: 'red' });


				buttons[pos[j]].snapshotLocal = new BI.Buttons.Button('Snapshot', function() {
					CI[pos2[j]].localSnapshot(j == 0 ? Entry.structure : Entry.data);
				}, { color: 'blue' });

				buttons[pos[j]].autosaveLocal = new BI.Buttons.Button('Autosave', function(event, val, item) {
					CI[pos2[j]].localAutosave(val, function() {
						return j == 0 ? Entry.structure : Entry.data;
					}, function() {
						item.children().find('span').remove();
						var date = new Date();
						date = pad(date.getHours()) + ":" + pad(date.getMinutes());
						item.children().append('<span> (' + date + ')</span>');
					});
				}, { checkbox: true, color: 'blue' });


				buttons[pos[j]].branchLocal = new BI.Buttons.Button('Make branch', function() {

					// Make here dialog
					$("<div />").dialog({ modal: true, width: '80%', title: "Edit Vizualizer"}).biForm({}, function() {
				
						var inst = this;			
						var section = new BI.Forms.Section('cfg', { multiple: false });
						this.addSection(section);
						var title = new BI.Title();
						title.setLabel('Branch name');
						section.setTitle(title);
						
						var groupfield = new BI.Forms.GroupFields.List('general');
						section.addFieldGroup(groupfield);
						
						var field = groupfield.addField({
							type: 'Text',
							name: 'name'
						});
						field.setTitle(new BI.Title('Branch name'));
						
						var save = new BI.Buttons.Button('Save', function() {
							inst.dom.trigger('stopEditing');
							var value = inst.getValue();

							CI[pos2[j]].localBranch((j == 0 ? Entry.structure : Entry.data), value.cfg[0].general[0].name[0]);	
							inst.getDom().dialog('close');
						});
						
						save.setColor('blue');
						this.addButtonZone().addButton(save);
						
					}, function() {




					});

				}, { color: 'blue' });
				

				buttons[pos[j]].revertLocal = new BI.Buttons.Button('Revert to this version', function() {
					// Make here dialog
					CI[pos2[j]].localRevert((j == 0 ? Entry.structure : Entry.data));
				}, { color: 'blue' });

				buttons[pos[j]].localToServer = new BI.Buttons.Button('Push to server', function(event, val, item) {
					// Make here dialog
					CI[pos2[j]].serverPush((j == 0 ? Entry.structure : Entry.data)).done(function() {
						item.children().find('span').remove();
						var date = new Date();
						date = pad(date.getHours()) + ":" + pad(date.getMinutes());
						item.children().append('<span> (' + date + ')</span>');
					});
				}, { color: 'green' });
			}) (i);
		}

		if(CI.URLs['results']) {
			CI.Data = new CI.DataViewHandler(CI.URLs['results'], CI.URLs['resultBranch']);
			CI.Data.setType('data');
			CI.Data.onLoaded = function(data, path) {
				doData(data);
			}

			CI.Data.onReload = function(data, path) {
				doData(data);
			}
			CI.Data.load();
		} else if(CI.URLs['dataURL']) {
			$.getJSON(CI.URLs['dataURL'], {}, function(results) {
				doData(results);
			});
		}

		if(CI.URLs['views']) {
			CI.View = new CI.DataViewHandler(CI.URLs['views'], CI.URLs['viewBranch']);
			CI.View.setType('view');
			CI.View.onLoaded = function(structure, path) {

				doStructure(structure);
			}

			CI.View.onReload = function(structure, path) {

				doStructure(structure, true);
				CI.Repo.resendAll();
			}
			CI.View.load();
		} else if(CI.URLs['viewURL']) {
			$.getJSON(CI.URLs['viewURL'], {}, function(structure) {

				doStructure(structure);
			});
		}
	}
	
	function doStructure(structure, noLoad) {
		
		CI.Grid.init(structure.grid || {});
		CI.modules = {};
		entryPoint.structure = structure;
		Saver.setLatestScript(structure);
		
		if(!structure.entryPoint) 
			structure.entryPoint = { variables: [] };
		
		if(!structure.modules)
			structure.modules = [];
		
		if(typeof structure.configuration == "undefined")
			structure.configuration = {};

		if(typeof structure.configuration.variableFilters == "undefined")
			structure.configuration.variableFilters = {};

		if(structure.configuration.showMenuBarOnStart)
			$("#ci-expand-left").trigger('click');
			
		$("#ci-header .title").text(structure.configuration.title || 'No title').attr('contenteditable', 'true').bind('keypress', function(e) {
			if(e.keyCode == 13) {
				e.preventDefault();
				$(this).trigger('blur');
				return false;
			}
		}).bind('blur', function() {
			structure.configuration.title = $(this).text().replace(/[\r\n]/g, "");
			Saver.doSave();
		});
			
		entryPoint.entryData = structure.entryPoint;
		
		var scripts = entryPoint.entryData.actionscripts;
		var evaled = {};
		if(scripts) {
			for(var i = 0, l = scripts.length; i < l; i++) {
				eval("evaled[scripts[i].name] = function(value) { " + scripts[i].script + " }");
			}
			entryPoint.setActionScripts(scripts, evaled);
		}
		
		if(structure.modules !== undefined)
			for(var i = 0; i < structure.modules.length; i++) {
				entryPoint.addModuleFromJSON(structure.modules[i]);
			}
		
		CI.Grid.checkDimensions();

		if(noLoad)
			return;

		entryPoint.loadedStructure();
		
	}
	
	this.getStructure = getStructure;
	function getStructure() {
		return this.structure;
	}
	
	function doData(page) {

		entryPoint.data = page;
		entryPoint.loadedData();
	}
	
	init();
}


CI.EntryPoint.prototype = {

	loadedStructure: function() {
		this._loadedStructure = true;
		this.check();
	},

	loadedData: function() {
		this._loadedData = true;
		this.check();
	},

	check: function() {
		if(this._loadedData && this._loadedStructure)
			this.loaded();
	},


	loaded: function() {
		var self = this;
		var allVarPaths = [];
		if(this.entryData && this.entryData.variables && this.entryData.variables.length > 0) {
			var vars = this.entryData.variables;
			
			for(var i = 0; i < vars.length; i++) {
				allVarPaths.push(vars[i].jpath);	
				if(!vars[i].jpath && vars[i].url) {
					(function(variable) {
						self.data[variable.varname] = { value: null, url: variable.url };
						CI.DataType.fetchElementIfNeeded(self.data[variable.varname]).done(function(value) {
							CI.API.setSharedVar(variable.varname, value);
						});
					}) (vars[i]);
				} else if(!vars[i].jpath) {
					self.data[vars[i].varname] = {};
					CI.API.setSharedVar(vars[i].varname, self.data[vars[i].varname]);
				} else 
					CI.API.setSharedVarFromJPath(vars[i].varname, this.data, vars[i].jpath);
			}
		}

		if(this.data) {

			var jpath, varname, vars = [];
			for(var i in this.data) {
				jpath = 'element.' + i;
				if(i.slice(0, 1) == '_' || allVarPaths.indexOf(jpath) > -1)
					continue;
				
				varname = i;
				vars.push({ varname: varname, jpath: jpath });
				CI.API.setSharedVarFromJPath(varname, this.data, jpath);	

				var found = false;
				if(this.entryData.variables) {
					for(var j = 0, l = this.entryData.variables.length; j < l; j++) {
						if(this.entryData.variables[j].varname == varname)
							found = true;
					}

					if(!found)
						this.entryData.variables.push({ varname: varname, jpath: jpath });
				}
			}	
		}
			
		if(typeof this.onLoad == 'function')
			this.onLoad(this, this.data);
	},
	
	getEntryDataVariables: function() {
		return this.entryData.variables;
	},
	
	setEntryDataVariables: function(vars) {
		this.entryData.variables = vars;
		this.loaded();
	},

	getActionScripts: function() {
		return (this.entryData.actionscripts = this.entryData.actionscripts || []);
	},

	getActionScriptsEvaluated: function(name) {
		if(!this.evaluatedScripts)
			return false;
		
		return this.evaluatedScripts[name] || false;
	},

	setActionScripts: function(scripts, evals) {
		this.entryData.actionscripts = scripts;
		this.evaluatedScripts = evals;
	},

	getDataFromSource: function(child) {
		return this.data;
		/*
		if(!child)
			return this.data;
		else
			return this.data[child];*/
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