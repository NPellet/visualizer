
define(['jquery', 'util/repository', 'main/grid', 'util/api', 'util/context', 'util/datatraversing', 'util/versioning', 'modules/modulefactory', 'util/viewmigration'], function($, Repository, Grid, API, Context, Traversing, Versioning, ModuleFactory, Migration) {

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

		if( viewhandler && viewhandler._savedLocal != view && viewserver._savedServer != view ) {
			dommessage.view = true;
		}

		if( datahandler && datahandler._savedLocal != data && datahandler._savedServer != data ) {
			dommessage.data = true;
		}

		if( dommessage.view ) {
			message.push("The view file has not been saved. If you continue, you will loose your changes");
		}

		if( dommessage.data ) {
			message.push("The data file has not been saved. If you continue, you will loose your changes");
		}
		
		if( message.length > 0 ) {
			return message.join( "\n\n" );
		}
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

		var i = 0, l;

		view = Migration(view);

		if( reloading ) {
			reloadingView( );
		}

		if( ! reloading ) {

			Grid.init( view.grid, document.getElementById( "modules-grid" ) );

		} else {

			Grid.reset( view.grid );

		}

		ModuleFactory.empty( );
		
		view.modules = view.modules || new ViewArray();

		l = view.modules.length;

		view.variables = view.variables || new ViewArray();
		view.configuration = view.configuration || new ViewObject();
		view.configuration.title = view.configuration.title || 'No title';
		

		for( ; i < l ; ) {

			Grid.addModuleFromJSON( view.modules[ i ] );
			i ++
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

		if( ! _dataLoaded || ! _viewLoaded ) {
			return;
		}

		// If no variable is defined in the view, we start browsing the data and add all the first level
		if(view.variables.length == 0) {
			var jpath;
			for(var i in data) {

				if( i.slice( 0, 1 ) == '_' ) {
					continue;
				}

				view.variables.push( new ViewObject( { varname: i, jpath: "element." + i } ) );
			}
		}

		// Entry point variables
		for( var i = 0, l = view.variables; i < view.variables.length; i++ ) {
			// Defined by an URL

			if( ! view.variables[i].jpath && view.variables[i].url ) {

				variable.fetch( ).done( function( v ) {
					API.setVariable( variable.get( 'varname' ), v );
				} );

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

		return Versioning.getData().actionscripts || [];
	}

	function setActionScripts(scripts, evaledScripts) {
		this.evaluatedScripts = evaluatedScripts;
		Versioning.getData().actionscripts = scripts;
	}

	function configureEntryPoint() {
		var now = Date.now(),
			data = Versioning.getData(),
			view = Versioning.getView();



		var div = $('<div></div>').dialog( { modal: true, position: [ 'center', 50 ], width: '80%' } );
		div.prev( ).remove( );
		div.parent( ).css( 'z-index', 1000 );

		var options = [];
		Traversing.getJPathsFromElement(data, options);
		require(['./libs/forms2/form'], function(Form) {

			var form = new Form();
			
			form.init({
				onValueChanged: function( value ) {	}
			});

			form.setStructure({
				sections: {
					cfg: {
						options: {
							title: 'General configuration',
							icon: 'hostname'
						},

						groups: {
							tablevars: {

								options: {
									type: 'table',
									multiple: true
								},

								fields: {
									varname: {
										type: 'text',
										multiple: false,
										title: 'Variable name'
									},

									jpath: {
										type: 'combo',
										title: 'J-Path',
										options: options
									},

									url: {
										type: 'text',
										title: 'From URL'
									}
								}
							}
						}
					}
				}
			});


			form.onStructureLoaded().done(function() {
				form.fill({ 
					sections: {
						cfg: [{
							groups: {
								tablevars: [ view.variables ]
							}
						}]
					}
				});
			});


			form.addButton('Cancel', { color: 'blue' }, function() {
				div.dialog( 'close' );
			});

			form.addButton('Save', { color: 'green' }, function() {
				div.dialog('close');
				var data = form.getValue().sections.cfg[ 0 ].groups.tablevars[ 0 ];
				view.variables = data;
				_check(true);
			});

			form.onLoaded().done(function() {
				div.html(form.makeDom());
				form.inDom();
			});

		});
	}


	function configureActions() {
		
		var div = $('<div></div>').dialog({ modal: true, position: ['center', 50], width: '80%' });
		div.prev().remove();
		div.parent().css('z-index', 1000);


		require(['./libs/forms2/form'], function(Form) {

			var form = new Form();
			form.init({
				onValueChanged: function( value ) {	}
			});

			form.setStructure({
				sections: {
					general: {
						options: {
							title: 'Action scripting',
							icon: 'script_go'
						},

						sections: {

							actions: {
								options: {
									multiple: true,
									title: "Action"
								},

								groups: {
									action: {

										options: {
											type: 'list'
										},

										fields: {

											name: {
												type: 'text',
												title: 'Action name'
											},

											script: {
												type: 'jscode',
												title: 'Script'
											}
										}
									}
								}
							}
						}
					}
				}
			});


			form.onStructureLoaded().done(function() {

				form.fill({ 
					sections: {
						general: [{
							sections: {
								actions: getActionScripts()
							}
						}]
					}
				});
			});


			form.addButton('Cancel', { color: 'blue' }, function() {
				div.dialog( 'close' );
			});

			form.addButton('Save', { color: 'green' }, function() {

				var data = form.getValue().sections.general[ 0 ].sections.actions,
					actionScripts = {},
					i = 0,
					l = data.length

				for( ; i < l ; i ++ ) {
					eval( "evalscripted = function(value) { " + data[i].groups.action[ 0 ].script[ 0 ] + " } " );
					actionScripts[ data[ i ].groups.action[ 0 ].name[ 0 ] ] = evalscripted;
				}

				setActionScripts(data, actionScripts);
				div.dialog('close');
			});

			form.onLoaded().done(function() {
				div.html(form.makeDom());
				form.inDom();
			});

		});

			/*
				var actions = [];
				var save = new Button('Save', function() {
					form.dom.trigger('stopEditing');
					
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
	
		});*/
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
			

			Context.init( document.getElementById( 'modules-grid' ) );

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