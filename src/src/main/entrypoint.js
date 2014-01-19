
define([	'jquery',
			'src/header/header',
			'src/util/repository',
			'src/main/grid',
			'src/util/api',
			'src/util/context',
			'src/util/datatraversing',
			'src/util/versioning',
			'modules/modulefactory',
			'src/util/viewmigration',
			'src/util/actionmanager',
			'usr/datastructures/filelist'
], function($,
			Header,
			Repository,
			Grid,
			API,
			Context,
			Traversing,
			Versioning,
			ModuleFactory,
			Migration,
			ActionManager
) {

	var _viewLoaded, _dataLoaded;

	var evaluatedScripts = {};
	
	var RepositoryData = new Repository(),
		RepositoryHighlight = new Repository(),
		RepositoryActions = new Repository();

	API.setRepositoryData( RepositoryData );
	API.setRepositoryHighlights( RepositoryHighlight );
	API.setRepositoryActions( RepositoryActions );

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
		if( reloading ) {
			reloadingData( );
		}

		dataLoaded( );
	}

	function reloadingData() {

		RepositoryData.resetVariables( );
		RepositoryActions.resetVariables( );
		RepositoryHighlight.resetCallbacks( );
		RepositoryHighlight.resetVariables( );

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

		ActionManager.viewHasChanged( view );

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
				data[ view.variables[ i ].varname ] = new DataObject();
				API.setVariable( view.variables[ i ].varname, data[ view.variables[ i ].varname ] );

			} else {
				API.setVariable( view.variables[ i ].varname, data, view.variables[ i ].jpath );
			}
		}
	}


	function configureEntryPoint() {

		var now = Date.now(),
			data = Versioning.getData(),
			view = Versioning.getView();

		var div = $('<div></div>').dialog( { modal: true, position: [ 'center', 50 ], width: '80%' } );
		div.prev( ).remove( );
		div.parent( ).css( 'z-index', 1000 );

		var options = [ ];
		Traversing.getJPathsFromElement( data, options );
		require(['./forms/form'], function(Form) {

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
					},

					actionscripts: {
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
					},


					actionfiles: {
						options: {
							title: 'Action files',
							icon: 'server_go'
						},						

						groups: {
							action: {

								options: {
									type: 'table',
									multiple: true
								},

								fields: {

									name: {
										type: 'text',
										title: 'Action name'
									},

									file: {
										type: 'text',
										title: 'File'
									},

									mode: {
										type: 'combo',
										title: 'File type',
										options: [ { key: 'worker', title: 'WebWorker'}, { key: 'amd', title: 'Asynchronously loaded module'} ]
									}
								}
							}
						}
					},



					webservice: {
						options: {
							title: 'Webservice',
							icon: 'web_disk'
						},						

						sections: {

							general: {
								options: {
									multiple: true,
									title: 'Webservice instance'
								},

								groups: {

									general: {

										options: {
											type: 'list',
											multiple: true
										},

										fields: {

											action: {
												type: 'text',
												title: 'Triggering action'
											},

											url: {
												type: 'text',
												title: 'URL'
											},

											method: {
												type: 'combo',
												title: 'Method',
												options: [ {key: 'get', title: 'GET'}, {key: 'post', title: 'POST'} ]
											}
										}
									},

									varsin: {

										options: {
											type: 'table',
											multiple: true,
											title: 'Vars in'
										},

										fields: {

											action: {
												type: 'text',
												title: 'Triggering action'
											},

											url: {
												type: 'text',
												title: 'URL'
											}
										}
									},

									varsout: {

										options: {
											type: 'table',
											multiple: true,
											title: 'Variables out'
										},

										fields: {

											action: {
												type: 'combo',
												title: 'jPath'
											},

											url: {
												type: 'text',
												title: 'Variable name'
											}
										}
									},

									structure: {

										options: {
											type: 'list',
											multiple: true,
											title: 'Response structure'
										},

										fields: {

											action: {
												type: 'jscode',
												title: 'JSON'
											}
										}
									}
								}
							}

						}
					}
				}
			});


		//	console.log( ActionManager.getFilesForm() );

			form.onStructureLoaded( ).done(function() {
				form.fill({ 
					sections: {
						cfg: [ {
							groups: {
								tablevars: [ view.variables ]
							}
						} ],

						actionscripts: [ {
							sections: {
								actions: ActionManager.getScriptsForm()
							}
						} ],


						actionfiles: ActionManager.getFilesForm()
					}
				});
			});


			form.addButton('Cancel', { color: 'blue' }, function() {
				div.dialog( 'close' );
			});

			form.addButton('Save', { color: 'green' }, function() {
				div.dialog('close');

				var data;

				/* Entry variables */
				data = form.getValue().sections.cfg[ 0 ].groups.tablevars[ 0 ];
				view.variables = data;
				_check(true);


				/* Handle actions scripts */
				var data = form.getValue().sections.actionscripts[ 0 ].sections.actions;
				ActionManager.setScriptsFromForm( data );
				/* */


				/* Handle actions files */
				var data = form.getValue().sections.actionfiles;
				ActionManager.setFilesFromForm( data );
				/* */

			});

			form.onLoaded().done(function() {
				div.html(form.makeDom());
				form.inDom();
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
			
			// Sets the header
            var configJson = urls['config'] || './usr/config/default.json';

			$.getJSON( configJson, { }, function( cfgJson ) {
			
				if( cfgJson.header ) {
					Header.init( cfgJson.header );
				}

				if( cfgJson.modules ) {
					ModuleFactory.setModules( cfgJson.modules );
				}

				// Set the filters
				API.setAllFilters( cfgJson.filters || [ ] );
			} );




			Context.init( document.getElementById( 'modules-grid' ) );

			Context.listen(Context.getRootDom(), [
				['<li class="ci-item-configureentrypoint" name="refresh"><a><span class="ui-icon ui-icon-key"></span>Global preferences</a></li>', 
				function() {
					configureEntryPoint();
				}]]
			);

/*
			Context.listen(Context.getRootDom(), [
				['<li class="ci-item-configureactions" name="refresh"><a><span class="ui-icon ui-icon-clock"></span>Configure actions</a></li>', 
				function() {
					configureActions();
				}]]
			);
*/

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

		//getActionScripts: getActionScripts,
		//setActionScripts: setActionScripts,

		//getActionScriptsEvaluated: function(name) {
			//return this.evaluatedScripts[name] || undefined;
		//},

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