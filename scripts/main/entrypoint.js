
define(['jquery', 'util/repository', 'main/grid', 'util/api', 'util/context', 'util/datatraversing', 'util/versionhandler'], function($, Repository, Grid, API, Context, Traversing, VersionHandler) {

	var view, data, viewhandler, datahandler;
	var _viewLoaded, _dataLoaded;
	var _onLoaded;

	var evaluatedScripts = {};
	
	var RepositoryData = new Repository(),
		RepositoryHighlight = new Repository(),
		RepositoryActions = new Repository();

	API.setRepositoryData(RepositoryData);
	API.setRepositoryHighlights(RepositoryHighlight);
	API.setRepositoryActions(RepositoryActions);

	window.onbeforeunload = function() {
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

	function doScripts() {

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

	function doView(v, noLoad) {
		view = v;

		Grid.init(view.grid, document.getElementById("ci-modules-grid"));

		view.modules = view.modules || [];
		view.variables = view.variables || [];
		view.configuration = view.configuration || {};
		//structure.configuration.variableFilters = structure.configuration.variableFilters || {};
		view.configuration.title = view.configuration.title || 'No title';
	
		for(var i = 0; i < view.modules.length; i++)
			Grid.addModuleFromJSON(view.modules[i]);

		Grid.checkDimensions();
		if(noLoad)
			return;
		
		viewLoaded();
	}

	function doData(d) {
		data = d;
		dataLoaded();
	}


	function viewLoaded() {
		_viewLoaded = true;
		_check();
	}

	function dataLoaded() {
		_dataLoaded = true;
		_check();
	}

	function _check(reloading) {

		var self = this;
		if(_dataLoaded && _viewLoaded) {

			if(_onLoaded && !reloading) {
				_onLoaded.call();

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

			}

			// If no variable is defined in the view, we start browsing the data and add all the first level
			if(view.variables.length == 0) {
				var jpath;
				for(var i in data) {
					if(i.slice(0, 1) == '_')
						continue;
					view.variables.push({ varname: i, jpath: i });
				}
			}

			for(var i = 0, l = view.variables; i < view.variables.length; i++) {
				// Defined by an URL
				if(!view.variables[i].jpath && view.variables[i].url) {

					(function(variable) {				
						Traversing.fetchElementIfNeeded(self.data[variable.varname]).done(function(value) {
							RepositoryData.set(variable.varname, value);
						});
					}) (view.variables[i]);

				} else if(!view.variables[i].jpath) {

					// If there is no jpath, we assume the variable is an object and we add it in the data stack
					// Note: if that's not an object, we will have a problem...
					data[view.variables[i].varname] = {};

					RepositoryData.set(view.variables[i].varname, data[view.variables[i].varname]);
				} else {
					RepositoryData.set(view.variables[i].varname, this.data, "element." + view.variables[i].jpath);
				}
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
		var now = Date.now();


		require(['forms/formfactory', 'jqueryui', 'forms/button'], function(FormFactory, jqueryui, Button) {

			var div = $('<div></div>').dialog({ modal: true, width: '80%', title: "Edit entry point"});
			div.parent().css('zIndex', 10000)
			var options = [];

			for(var i in data)
				options.push({title: i, key: i});

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
					view.variables = data;
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

		init: function(onLoaded) {

			var url, i, args, urls = {};
			_onLoaded = onLoaded;
			
			url = window.document.location.search.substring(1).split('&');
			for(var i = 0; i < url.length; i++) {
				var args = url[i].split('=');
				urls[args[0]] = unescape(args[1]);
			}


			if(urls['results']) {
				datahandler = new VersionHandler(urls['results'], urls['resultBranch'], urls['dataURL']);
				datahandler.setType('data');
				datahandler.onLoaded = function(data, path) {
					doData(data);
				}
				datahandler.onReload = function(data, path) {
					doData(data);
				}
				datahandler.load();

			} else if(urls['dataURL']) {
				$.getJSON(urls['dataURL'], {}, function(results) {
					doData(results);
				});
			} else {
				doData({});
			}

			if(urls['views']) {
				viewhandler = new VersionHandler(urls['views'], urls['viewBranch'], urls['viewURL']);
				viewhandler.setType('view');
				viewhandler.onLoaded = function(structure, path) {
					doView(structure);
				}
				viewhandler.onReload = function(structure, path) {
					doView(structure, true);
					RepositoryData.resendAll();
				}

				viewhandler.load();

			} else if(urls['viewURL']) {
				$.getJSON(urls['viewURL'], {}, function(structure) {
					doView(structure);
				});
			} else {
				doView({});
			}

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