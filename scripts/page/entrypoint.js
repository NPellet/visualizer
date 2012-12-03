

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

		CI.Data = new CI.DataViewHandler(CI.URLs['dataURL']);
		CI.Data.setType('data');

		CI.Data.onLoaded = function(data, path) {
			
			doData(data);
		}

		CI.View = new CI.DataViewHandler(CI.URLs['viewURL']);
		CI.View.setType('view');
		CI.View.onLoaded = function(structure, path) {
			
			doStructure(structure);
		}

		doGetStructure();
		doGetData();

	}
	
	function doStructure(structure) {
		
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
			if(e.keyCode == 13) { // Enter
				e.preventDefault();
				$(this).trigger('blur');
				return false;
			}
		}).bind('blur', function() {
			structure.configuration.title = $(this).text().replace(/[\r\n]/g, "");
			Saver.doSave();
		});
			
		entryPoint.entryData = structure.entryPoint;
		
		if(structure.modules !== undefined)
			for(var i = 0; i < structure.modules.length; i++) {
				entryPoint.addModuleFromJSON(structure.modules[i]);
			}
		
		CI.Grid.checkDimensions();

		entryPoint.loaded();
		
	}
	
	function doGetStructure() {

		$.when(CI.View.load()).then(function(el) {
			doStructure(el);
		});
	}
	
	this.getStructure = getStructure;
	function getStructure() {
		return this.structure;
	}
	
	function doData(page) {
		entryPoint.data = page;
		entryPoint.loaded();
	}
	
	function doGetData() {
		var self = this;
		CI.Data.load().done(function(el) {
			
			doData(el);
		});
	}
	init();
}


CI.EntryPoint.prototype = {

	loaded: function() {

		if(this.entryData && this.entryData.variables && this.entryData.variables.length > 0) {
			var vars = this.entryData.variables;
			for(var i = 0; i < vars.length; i++) {
				CI.API.setSharedVarFromJPath(vars[i].varname, this.data, vars[i].jpath);
			}
		}

		if(this.data) {

			var jpath, varname, vars = [];
			for(var i in this.data) {
				if(i.slice(0, 1) == '_')
					continue;
				jpath = 'element.' + i;
				varname = i;
				vars.push({ varname: varname, jpath: jpath });
				CI.API.setSharedVarFromJPath(varname, this.data, jpath);	
			}
			this.entryData.variables = vars;
		}

		
		
		if(typeof this.onLoad == 'function')
			this.onLoad(this, this.data);
	},
	
	getEntryDataVariables: function() {
		
		
		return this.entryData.variables;		
		
	},
	
	setEntryDataVariables: function(vars) {
		this.entryData.variables = vars;
		console.log(vars);
		this.loaded(this.data, false);
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