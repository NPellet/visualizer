define(['jquery',
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
	'src/util/debug'
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
		PouchDBUtil,
		Debug
		) {
	"use strict";

	var _viewLoaded, _dataLoaded;

	var RepositoryData = new Repository(),
		RepositoryHighlight = new Repository(),
		RepositoryActions = new Repository();

	API.setRepositoryData(RepositoryData);
	API.setRepositoryHighlights(RepositoryHighlight);
	API.setRepositoryActions(RepositoryActions);


	function doView(view) {

		var i = 0, l;
		DataObject.recursiveTransform( view, false );

		view = Migration(view);
		view.grid = view.grid || new DataObject();
		
		if (this.viewLoaded) {
			reloadingView( );
			Grid.reset(view.grid);
		} else {
			Grid.init(view.grid, document.getElementById("modules-grid"));
			this.viewLoaded = true;
		}

		ModuleFactory.empty( );

		view.modules = view.modules || new DataArray();

		l = view.modules.length;

		view.variables = view.variables || new DataArray();
		view.pouchvariables = view.pouchvariables || new DataArray();
		view.configuration = view.configuration || new DataObject();
		view.configuration.title = view.configuration.title || 'No title';

		for (; i < l; ) {
			
			Grid.addModuleFromJSON(view.getChildSync( [ 'modules', i++ ], true ) );
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
		if (reloading) {
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
		_check("view");
	}

	function dataLoaded() {
		_dataLoaded = true;
		_check("data");
	}

	function _check(loading) {

		if (!_dataLoaded || !_viewLoaded) {
			return;
		}

		var view = Versioning.getView();
		var data = Versioning.getData();


		var def = $.Deferred();
		if (view.init_script) {
			var prefix = '(function(init_deferred){"use strict";';
			var script = view.init_script[ 0 ].groups.general[ 0 ].script[ 0 ] || "";
			var suffix = "})(def);";
			if (script.indexOf("init_deferred") === -1) {
				suffix += "def.resolve();";
			}
			eval(prefix + script + suffix);
		} else {
			def.resolve();
		}

		def.done(function() {

			ActionManager.viewHasChanged(view);

			// If no variable is defined in the view, we start browsing the data and add all the first level
			if (view.variables.length === 0) {
				for (var i in data) {

					if (i.charAt(0) === '_') {
						continue;
					}

					view.variables.push( new DataObject( { varname: i, jpath: [ i ] } ) );
				}
			}

			// Entry point variables
			API.loading("Fetching remote variables");
			var entryVar;
			var fetching = [];
			for (var i = 0, l = view.variables.length; i < l; i++) {
				entryVar = view.traceSync(['variables', i]);
				if (entryVar.varname) {
					// Defined by an URL
					if (entryVar.url) {

						fetching.push( entryVar.fetch( ).done(function(v) {
							var varname = v.varname;
							data[ varname ] = v.value;

							API.setVariable( varname, false, [ varname ] );
						}) );

					} else if ( ! entryVar.jpath ) {

						// If there is no jpath, we assume the variable is an object and we add it in the data stack
						// Note: if that's not an object, we will have a problem...
						API.createData( name, false );

					} else {

						if( typeof entryVar.jpath === "string" ) {
							entryVar.jpath = entryVar.jpath.split('.');
							entryVar.jpath.shift();
						}

						API.setVariable( entryVar.varname, false, entryVar.jpath );
					}
				}
			}

			$.when.apply( $, fetching ).then( function() {
				API.stopLoading("Fetching remote variables");
			});

			API.loading("Fetching local variables");
			var pouching = [], pouchVariable;
			for (var i = 0, l = view.pouchvariables.length; i < l; i++) {
				pouchVariable = view.pouchvariables[ i ];
				if(pouchVariable.dbname && pouchVariable.varname) {
					(function(k) {

						pouching.push( PouchDBUtil.pouchToVar(view.pouchvariables[ k ].dbname, view.pouchvariables[ k ].id, function(el) {

							el.linkToParent( data, view.pouchvariables[ k ].varname );
							API.setVariable( view.pouchvariables[ k ].varname, false, [ view.pouchvariables[ k ].varname ] );

						}) );

					}) (i);
				}
			}
			
			Promise.all( pouching ).then( function() {
				
				API.stopLoading("Fetching local variables");	
			});
			
			// Pouch DB replication
			PouchDBUtil.abortReplications();
			if (view.couch_replication) {
				var couchData = view.couch_replication[ 0 ].groups.couch[ 0 ];
				for (var i = 0, l = couchData.length; i < l; i++) {
					if (couchData[ i ].couchurl) {
						PouchDBUtil.replicate(couchData[ i ].pouchname, couchData[ i ].couchurl, {direction: couchData[ i ].direction, continuous: couchData[ i ].continuous ? couchData[ i ].continuous.length : true});
					}
				}
			}
		});
	}

	function configureEntryPoint() {

		var now = Date.now(),
				data = Versioning.getData(),
				view = Versioning.getView();

		var div = $('<div></div>').dialog({modal: true, position: ['center', 50], width: '80%'});
		div.prev( ).remove( );
		div.parent( ).css('z-index', 1000);

		var options = [];
		
		Traversing.getJPathsFromElement(data, options);

		require(['./forms/form'], function(Form) {

			var form = new Form();

			form.init({
				onValueChanged: function(value) {
				}
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
										options: options,
										extractValue: function( val ) {
											if(val){
												var val2 = val.split(".");
												val2.shift();
												return val2;
											}
										},

										insertValue: function( val ) {
											return "element." + (val || []).join(".");
										}
									},
									url: {
										type: 'text',
										title: 'From URL'
									},
									timeout: {
										type: "text",
										title: "Timeout"
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
										options: [{key: 'worker', title: 'WebWorker'}, {key: 'amd', title: 'Asynchronously loaded module'}]
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
												options: [{key: 'get', title: 'GET'}, {key: 'post', title: 'POST'}]
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
					init_script: {
						options: {
							title: 'Initialization script',
							icon: 'scripts'
						},
						groups: {
							general: {
								options: {
									type: 'list',
									multiple: true
								},
								fields: {
									script: {
										type: 'jscode',
										title: 'Javascript to execute'
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
									},
									direction: {
										type: 'combo',
										title: 'Direction',
										options: [{key: 'PtoC', title: 'Pouch -> Couch'}, {key: 'CtoP', title: 'Couch -> Pouch'}, {key: 'both', title: 'Both ways'}],
										'default': 'both'
									},
									continuous: {
										type: 'checkbox',
										title: 'Continuous replication',
										options: {continuous: 'Continuous'}
									}

								}
							}
						}
					}
				}
			});
			
			form.onStructureLoaded( ).done(function() {
				form.fill({
					sections: {
						cfg: [{
								groups: {
									tablevars: [view.variables],
									pouchvars: [view.pouchvariables]
								}
							}],
						actionscripts: [{
								sections: {
									actions: ActionManager.getScriptsForm()
								}
							}],
						init_script: view.init_script,
						actionfiles: ActionManager.getFilesForm(),
						webcron: [{
								groups: {
									general: [view.crons || []]
								}
							}],
						script_cron: view.script_crons,
						couch_replication: view.couch_replication
					}
				});
			});

			form.addButton('Cancel', {color: 'blue'}, function() {
				div.dialog('close');
			});

			form.addButton('Save', {color: 'green'}, function() {
				div.dialog('close');

				var data,
						allcrons,
						value = form.getValue();

				/* Entry variables */
				data = new DataArray(value.sections.cfg[ 0 ].groups.tablevars[ 0 ], true);
				allcrons = new DataObject(value.sections.webcron[ 0 ].groups.general[ 0 ], true);



				view.variables = data;
				view.crons = allcrons;

				view.couch_replication = value.sections.couch_replication;
				view.init_script = value.sections.init_script;

				// PouchDB variables
				var data = new DataArray(value.sections.cfg[ 0 ].groups.pouchvars[ 0 ]);
				view.pouchvariables = data;


				_check(true);

				/* Handle actions scripts */
				var data = value.sections.actionscripts[ 0 ].sections.actions;
				ActionManager.setScriptsFromForm(data);
				/* */


				/* Handle actions files */
				var data = value.sections.actionfiles;
				ActionManager.setFilesFromForm(data);
				/* */

				if (typeof CronManager !== "undefined") {
					CronManager.setCronsFromForm(data, view);
				}

			});

			form.onLoaded().done(function() {
				div.html(form.makeDom());
				form.inDom();
			});

		});
	}

	return {
//		getModules: function() {
//			return Modules;
//		},
//
//		getView: function() {
//			return view;
//		},
//
//		getData: function() {
//			return data;
//		},
//
//		getViewHandler: function() {
//			return viewhandler || false;
//		},
//
//		getDataHandler: function() {
//			return datahandler || false;
//		},

		init: function(urls, type) {

			// Sets the header
			var configJson = urls['config'] || 'usr/config/default.json';

			$.getJSON(require.toUrl(configJson), {}, function(cfgJson) {

				if (cfgJson.usrDir) {
					require.config({
						paths: {
							usr: cfgJson.usrDir
						}
					});
				}
				
				if(urls['debug']) {
					Debug.setDebugLevel(parseInt(urls['debug']));
				} else if(cfgJson.debugLevel) {
					Debug.setDebugLevel(cfgJson.debugLevel);
				}

				if (cfgJson.lockView || cfgJson.viewLock) {
					API.viewLock();
				}

				if (cfgJson.header) {
					Header.init(cfgJson.header);
				}

				if (cfgJson.modules) {
					ModuleFactory.setModules(cfgJson.modules);
				}

				// Set the filters
				API.setAllFilters(cfgJson.filters || []);

			}).fail(function(a, b) {
				console.error("Error loading the config : " + b);
			}).always(function( ) {
				require(['usr/datastructures/filelist'], function() {
					Context.init(document.getElementById('modules-grid'));

					if (!API.isViewLocked()) {

						Context.listen(Context.getRootDom(), [
							['<li class="ci-item-configureentrypoint" name="refresh"><a><span class="ui-icon ui-icon-key"></span>Global preferences</a></li>',
								function() {
									configureEntryPoint();
								}]]
								);

						Context.listen(Context.getRootDom(), [
							['<li class="ci-item-refresh" name="refresh"><a><span class="ui-icon ui-icon-arrowrefresh-1-s"></span>Refresh page</a></li>',
								function() {
									document.location.reload();
								}]]
								);
					}

					Versioning.setViewLoadCallback(doView);
					Versioning.setDataLoadCallback(doData);

					Versioning.setViewJSON({});
					Versioning.setDataJSON({});

					Versioning.setURLType(type);

					var viewInfo = {
						view: {
							urls: urls['views'],
							branch: urls['viewBranch'],
							url: urls['viewURL']
						},
						data: {
							urls: urls['results'],
							branch: urls['resultBranch'],
							url: urls['dataURL']
						}
					};
					window.history.replaceState({type: "viewchange", value: viewInfo}, "");
					Versioning.switchView(viewInfo, false);


				});
			});

		},
//		getVariables: function( ) {
//			return view.variables;
//		},
//		
//		setVariables: function( vars ) {
//			view.variables = vars;
//			loaded();
//		},
//
//		setVariable: function( varname, varvalue ) {
//			view.variables[ varname ] = varvalue;
//		},

		//getActionScripts: getActionScripts,
		//setActionScripts: setActionScripts,

		//getActionScriptsEvaluated: function(name) {
		//return this.evaluatedScripts[name] || undefined;
		//},

//		getConfiguration: function() {
//			return view.configuration;
//		},
//		
//		setConfiguration: function(cfg) {
//			return view.configuration = cfg;
//		},

		getRepositoryData: function() {
			return RepositoryData;
		},
		getRepositoryActions: function() {
			return RepositoryActions;
		},
		getRepositoryHighlight: function() {
			return RepositoryHighlight;
		}
	};
});
