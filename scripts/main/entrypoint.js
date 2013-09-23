
define(['jquery', 'util/repository', 'main/grid', 'util/api', 'util/context', 'util/datatraversing', 'util/versioning', 'modules/modulefactory'], function($, Repository, Grid, API, Context, Traversing, Versioning, ModuleFactory) {

	var _viewLoaded, _dataLoaded;

	var evaluatedScripts = {};
	
	var RepositoryData = new Repository(),
		RepositoryHighlight = new Repository(),
		RepositoryActions = new Repository();

	API.setRepositoryData(RepositoryData);
	API.setRepositoryHighlights(RepositoryHighlight);
	API.setRepositoryActions(RepositoryActions);

	window.onbeforeunload = function() {
		return;
		var dommessage = { 
			data: false, 
			view: false
		},
			data = JSON.stringify(data),
			view = JSON.stringify(view),
			message = [];

		if(viewhandler._savedLocal != view && viewserver._savedServer != view)
			dommessage.view = true;

		if(datahandler._savedLocal != data && datahandler._savedServer != data)
			dommessage.data = true;

		if(dommessage.view)
			message.push("The view file has not been saved. If you continue, you will loose your changes");
		if(dommessage.data)
			message.push("The data file has not been saved. If you continue, you will loose your changes");
		
		if(message.length > 0)
			return message.join("\n\n");
	}

	function doScripts(data) {

		var scripts = data.actionscripts;
		if(!scripts)
			return;

		var evaled = {};
		if(scripts) {
			for(var i = 0, l = scripts.length; i < l; i++) {
				eval("evaled[scripts[i].name] = function(value) { " + scripts[i].script + " }");
			}
			
			this.entryData.actionscripts = scripts;
			this.evaluatedScripts = evals;

			API.setEvaluatedScripts(evals);
		}
	}

	function doView(view, reloading) {

		if(reloading)
			reloadingView();
		console.log(window.ViewArray);
		Grid.init(view.grid, document.getElementById("ci-modules-grid"));

		view.modules = view.modules || new ViewArray();
		view.variables = view.variables || new ViewArray();
		view.configuration = view.configuration || new ViewObject();
		view.configuration.title = view.configuration.title || 'No title';
		
		for(var i = 0; i < view.modules.length; i++) {
			Grid.addModuleFromJSON(view.modules[i]);
		}
		Grid.checkDimensions();
		view.modules = ModuleFactory.getDefinitions();
		viewLoaded();
	}

	function reloadingView() {
		// Grid is automatically emptied
		RepositoryData.resetCallbacks();
		RepositoryActions.resetCallbacks();

	}

	function doData(data, reloading) {
		if(reloading)
			reloadingData();
		dataLoaded();
	}

	function reloadingData() {
		RepositoryData.resetVariables();
		RepositoryActions.resetVariables();
		RepositoryHighlight.resetCallbacks();
		RepositoryHighlight.resetVariables();
	}

	function viewLoaded() {
		_viewLoaded = true;
		_check();
	}

	function dataLoaded() {
		_dataLoaded = true;
		_check();
	}

	function _check() {
		var view = Versioning.getView(),
			data = Versioning.getData();

		if(!_dataLoaded || !_viewLoaded)
			return;

		// If no variable is defined in the view, we start browsing the data and add all the first level
		if(view.variables.length == 0) {
			var jpath;
			for(var i in data) {
				if(i.slice(0, 1) == '_')
					continue;

				view.variables.push(new ViewObject({ varname: i, jpath: "element." + i }));
			}
		}

		// Entry point variables
		for(var i = 0, l = view.variables; i < view.variables.length; i++) {
			// Defined by an URL

			if(!view.variables[i].jpath && view.variables[i].url) {

				variable.fetch().done(function(v) {
					API.setVariable(variable.get('varname'), v);
				});

			} else if(!view.variables[i].jpath) {

				// If there is no jpath, we assume the variable is an object and we add it in the data stack
				// Note: if that's not an object, we will have a problem...
				data[view.variables[i].varname] = new DataObject();
				API.setVariable(view.variables[i].varname, data[view.variables[i].varname]);
			} else {
				API.setVariable(view.variables[i].varname, data, view.variables[i].jpath);
			}
		}
	}

	function getActionScripts() {
		return data.actionscripts || [];
	}

	function setActionScripts(scripts, evaledScripts) {
		this.evaluatedScripts = evaluatedScripts;
		data.actionscripts = scripts;
	}

	function configureEntryPoint() {
		var now = Date.now(),
			data = Versioning.getData(),
			view = Versioning.getView();


		require(['forms/formfactory', 'jqueryui', 'forms/button'], function(FormFactory, jqueryui, Button) {

			var div = $('<div></div>').dialog({ modal: true, width: '80%', title: "Edit entry point"});
			div.parent().css('zIndex', 10000)
			var options = [];

			Traversing.getJPathsFromElement(data, options);

			//for(var i in data)
			//	options.push({title: i, key: i});

			FormFactory.newform(div, {
				sections: {
					'cfg': {
						config: {
							multiple: true,
							title: 'Entry variables'
						},

						groups: {
							'tablevars': {
								config: {
									type: 'table'
								},

								fields: [

									{
										type: 'Text',
										name: 'varname',
										multiple: false,
										title: 'Variable'
									},

									{
										type: 'Combo',
										name: 'jpath',
										title: 'jPath',
										options: options
									},

									{
										type: 'Text',
										name: 'url',
										title: 'URL'
									}
								]
							}
						}
					}
				}
			}, function(form) {
				var save = new Button('Save', function() {
					form.dom.trigger('stopEditing');
					var value = form.getValue();
					var data = value.cfg[0].tablevars[0];

					view.set('variables', data, true);
					
					_check(true);
					form.getDom().dialog('close');
				});
				
				save.setColor('blue');
				form.addButtonZone(save);


				var vars = { varname: [], jpath: [], sourcename: [], url: [] };
				var entryVars = view.variables;

				for(var i = 0; i < entryVars.length; i++) {
					vars.varname.push(entryVars[i].varname);
					vars.jpath.push(entryVars[i].jpath);
					vars.url.push(entryVars[i].url || '');
				}

					
				var fill = { 
					sections: {
						cfg: [
							{
								groups: {
									tablevars: [vars]
								}
							}
						]
					}
				};
				form.fillJson(fill);
			});
		});
	}


	function configureActions() {
		
		require(['forms/formfactory', 'jqueryui', 'forms/button'], function(FormFactory, jqueryui, Button) {

			var div = $('<div></div>').dialog({ modal: true, width: '80%', title: "Edit actions"});
			div.parent().css('zIndex', 10000);


			FormFactory.newform(div, {
				sections: {
					'general': {
						config: {
							multiple: true,
							title: 'Execute script on actions'
						},

						groups: {
							'action': {
								config: {
									type: 'list'
								},

								fields: [

									{
										type: 'Text',
										name: 'actionname',
										multiple: false,
										title: 'Action name'
									},

									{
										type: 'JSCode',
										name: 'script',
										multiple: false,
										title: 'Script to execute'
									}
								]
							}
						}
					}
				}
			}, function(form) {
				
				var actions = [];
				var save = new Button('Save', function() {
					form.dom.trigger('stopEditing');
					var value = form.getValue(), data = value.general, evalscripted;
					var actionScripts = {};

					for(var i = 0; i < data.length; i++) {
						eval("evalscripted = function(value) { " + data[i].action[0].script[0] + " } ");
						actions.push({name: data[i].action[0].actionname[0], script: data[i].action[0].script[0] });
						actionScripts[data[i].action[0].actionname[0]] = evalscripted;
					}

					setActionScripts(actions, actionScripts);
					div.dialog('close');
				});
				save.setColor('blue');
				form.addButtonZone(save);
				var vars = [], action;
				var scripts = getActionScripts();
				for(var i = 0; i < scripts.length; i++) {
					action = { groups: { action: [{actionname: [ scripts[i].name ], script: [ scripts[i].script ] }]}};
					vars.push(action);
				}
				var fill = { 
					sections: {
						general: vars
					}
				};
				form.fillJson(fill);	

			});
	
		});
	}

	

	return {

		getModules: function() {
			return Modules;
		},

		getView: function() {
			return view;
		},

		getData: function() {
			return data;
		},

		getViewHandler: function() {
			return viewhandler || false;
		},

		getDataHandler: function() {
			return datahandler || false;
		},

		init: function(urls) {

			var url, i, args;

			
			Versioning.setView(urls['views'], urls['viewBranch'], urls['viewURL']);
			Versioning.setViewLoadCallback(doView);

			Versioning.setData(urls['results'], urls['resultBranch'], urls['dataURL']);
			Versioning.setDataLoadCallback(doData);
			

			Context.init($("#ci-modules-grid").get(0));

			Context.listen(Context.getRootDom(), [
				['<li class="ci-item-configureentrypoint" name="refresh"><a><span class="ui-icon ui-icon-key"></span>Configure entry point</a></li>', 
				function() {
					configureEntryPoint();
				}]]
			);


			Context.listen(Context.getRootDom(), [
				['<li class="ci-item-configureactions" name="refresh"><a><span class="ui-icon ui-icon-clock"></span>Configure actions</a></li>', 
				function() {
					configureActions();
				}]]
			);


			Context.listen(Context.getRootDom(), [
				['<li class="ci-item-refresh" name="refresh"><a><span class="ui-icon ui-icon-arrowrefresh-1-s"></span>Refresh page</a></li>', 
				function() {
					document.location.href = document.location.href;
				}]]
			);


		},


		getVariables: function() {
			return view.variables;
		},
		
		setVariables: function(vars) {
			view.variables = vars;
			loaded();
		},

		setVariable: function(varname, varvalue) {
			view.variables[varname] = varvalue;
		},

		getActionScripts: getActionScripts,
		setActionScripts: setActionScripts,

		getActionScriptsEvaluated: function(name) {
			return this.evaluatedScripts[name] || undefined;
		},

		getConfiguration: function() {
			return view.configuration;
		},
		
		setConfiguration: function(cfg) {
			return view.configuration = cfg;
		},

		getRepositoryData: function() {
			return RepositoryData;
		},

		getRepositoryActions: function() {
			return RepositoryActions;
		},

		getRepositoryHighlight: function() {
			return RepositoryHighlight;
		}
	}

});