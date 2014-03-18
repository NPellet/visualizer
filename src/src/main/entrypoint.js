
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
			'src/util/cron',
			'src/util/pouchtovar',
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
			ActionManager,
			Cron,
			PouchDBUtil
) {

	var _viewLoaded, _dataLoaded;

	var evaluatedScripts = {};
	var crons = [];
	
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

	
	function doView(view) {

		var i = 0, l;

		view = Migration(view);

		if( this.viewLoaded ) {
			reloadingView( );
			Grid.reset( view.grid );
		} else {
			Grid.init( view.grid, document.getElementById( "modules-grid" ) );
			this.viewLoaded = true;
		}

		ModuleFactory.empty( );
		
		view.modules = view.modules || new ViewArray();

		l = view.modules.length;

		view.variables = view.variables || new ViewArray();
		view.pouchvariables = view.pouchvariables || new ViewArray();
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

		var view = Versioning.getView();
		var data = Versioning.getData();

		if( ! _dataLoaded || ! _viewLoaded ) {
			return;
		}

		ActionManager.viewHasChanged( view );

		// If no variable is defined in the view, we start browsing the data and add all the first level
		if(view.variables.length === 0) {
			for(var i in data) {

				if( i.charAt(0) === '_' ) {
					continue;
				}

				view.variables.push( new ViewObject( { varname: i, jpath: "element." + i } ) );
			}
		}

		// Entry point variables
		for( var i = 0, l = view.variables.length; i < l; i++ ) {
			// Defined by an URL

			if( ! view.variables[i].jpath && view.variables[i].url ) {

				view.variables[i].fetch( ).done( function( v ) {
                          
					var varname = v.varname;
					v.type = Traversing.getType( v.value );
					
					data[ varname ] = DataObject.check( v, true );
					
					API.setVariable( varname , data, [ varname ] );
				} );

			} else if( ! view.variables[ i ].jpath ) {

				// If there is no jpath, we assume the variable is an object and we add it in the data stack
				// Note: if that's not an object, we will have a problem...
				data[ view.variables[ i ].varname ] = new DataObject();
				API.setVariable( view.variables[ i ].varname, data, [ view.variables[ i ].varname ] );

			} else {

				API.setVariable( view.variables[ i ].varname, data, view.variables[ i ].jpath );
			}
		}


		for( var i = 0, l = view.pouchvariables.length ; i < l ; i ++ ) {

			( function ( k ) { 

				PouchDBUtil.makePouch( view.pouchvariables[ k ].dbname );
				PouchDBUtil.pouchToVar( view.pouchvariables[ k ].dbname, view.pouchvariables[ k ].id, function( el ) {

					el.setPouch( view.pouchvariables[ k ].dbname );
					el.linkToParent( data, view.pouchvariables[ k ].varname );
					API.setVariable( view.pouchvariables[ k ].varname, el );

				} );

			}) ( i );
		}

		// Pouch DB replication
		if( view.couch_replication ) {
			var couchData = view.couch_replication[ 0 ].groups.couch[ 0 ];
			for( var i = 0, l = couchData.length ; i < l ; i ++ ) {
				PouchDBUtil.makePouch( couchData[ i ].pouchname );

				if( couchData[ i ].couchurl ) {
					PouchDBUtil.replicate( couchData[ i ].pouchname, couchData[ i ].couchurl );
				}
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
									title: "Main variables",
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
							},


							pouchvars: {

								options: {
									type: 'table',
									title: "PouchDB variables",
									multiple: true
								},

								fields: {
									varname: {
										type: 'text',
										multiple: false,
										title: 'Variable name'
									},

									dbname: {
										type: 'text',
										title: 'DB name'
									},

									id: {
										type: 'text',
										title: 'ID'
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
					},

					webcron: {

						options: {
							title: 'Webservice crontab',
							icon: 'world_go'
						},						


						groups: {

							general: {

								options: {
									type: 'table',
									multiple: true
								},

								fields: {

									cronurl: {
										type: 'text',
										title: 'Cron URL'
									},

									crontime: {
										type: 'float',
										title: "Repetition (s)"
									},

									cronvariable: {
										type: "text",
										title: "Target variable"
									}
								}
							}
						}
					},


					script_cron: {

						options: {
							title: 'Script execution',
							icon: 'scripts'
						},						


						sections: {

							script_el: {

								options: {
									multiple: true,
									title: 'Script element'
								},

								groups: {

									general: {

										options: {
											type: 'list',
											multiple: true
										},

										fields: {


											crontime: {
												type: 'float',
												title: "Repetition (s)"
											},

											script: {
												type: 'jscode',
												title: 'Javascript to execute'
											}

										}
									}
								}
							}
						}
					},


					couch_replication: {

						options: {
							title: 'Couch replication',
							icon: 'scripts'
						},						


				
						groups: {

							couch: {

								options: {
									type: 'table',
									multiple: true
								},

								fields: {


									pouchname: {
										type: 'text',
										title: "Pouch DB name"
									},

									couchurl: {
										type: 'text',
										title: 'Couch URL'
									}

								}
							}
						}
					}
				}
			});


		//	console.log( ActionManager.getFilesForm() );

			form.onStructureLoaded( ).done(function() {
				/*console.log( { 
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


						actionfiles: ActionManager.getFilesForm(),
						webcron: [ {
							groups: {
								general: [ view.crons || [] ]
							}
						}],

//						script_cron: view.script_crons
					}
				} );*/
				form.fill({ 
					sections: {
						cfg: [ {
							groups: {
								tablevars: [ view.variables ],
								pouchvars: [ view.pouchvariables ]
							}
						} ],

						actionscripts: [ {
							sections: {
								actions: ActionManager.getScriptsForm()
							}
						} ],


						actionfiles: ActionManager.getFilesForm(),
						webcron: [ {
							groups: {
								general: [ view.crons || [] ]
							}
						}],

						script_cron: view.script_crons,
						couch_replication: view.couch_replication
					}
				});
			});


			form.addButton('Cancel', { color: 'blue' }, function() {
				div.dialog( 'close' );
			});

			form.addButton('Save', { color: 'green' }, function() {
				div.dialog('close');

				var data,
					allcrons,
					value = form.getValue();

				/* Entry variables */
				data = new ViewArray( value.sections.cfg[ 0 ].groups.tablevars[ 0 ], true );
				allcrons = new ViewObject( value.sections.webcron[ 0 ].groups.general[ 0 ], true );

				view.variables = data;
				view.crons = allcrons;

				view.couch_replication = value.sections.couch_replication;
				
				// PouchDB variables
				var data = new ViewArray( value.sections.cfg[ 0 ].groups.pouchvars[ 0 ] );
				view.pouchvariables = data;


				_check(true);

				/* Handle actions scripts */
				var data = value.sections.actionscripts[ 0 ].sections.actions;
				ActionManager.setScriptsFromForm( data );
				/* */


				/* Handle actions files */
				var data = value.sections.actionfiles;
				ActionManager.setFilesFromForm( data );
				/* */

				if( typeof CronManager !== "undefined" ) {
					CronManager.setCronsFromForm( data, view );
				}


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
			} ).fail(function(a, b){console.error("Error loading the config : "+b)});

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

		getVariables: function( ) {
			return view.variables;
		},
		
		setVariables: function( vars ) {
			view.variables = vars;
			loaded();
		},

		setVariable: function( varname, varvalue ) {
			view.variables[ varname ] = varvalue;
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