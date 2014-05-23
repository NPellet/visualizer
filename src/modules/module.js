define(['jquery', 'src/util/context', 'src/util/api', 'src/util/util', 'src/util/fullscreen'], function($, ContextMenu, API, Util, Fullscreen) {
	
	function init(module) {
		//define object properties
		var moduleURL = module.definition.url,
			def = $.Deferred();
		
		//Construct the DOM within the module
		
		Util.loadCss( require.toUrl( moduleURL + "style.css" ) );

		if( ! moduleURL ) {
			def.reject( );
			return def;
		}


		var ext = '';
		
		if( moduleURL.indexOf('http://') > -1 ) {
			ext = '.js';
		}

		require( [
			
			moduleURL + "model" + ext,
			moduleURL + "view" + ext,
			moduleURL + "controller" + ext

		], function(M, V, C) {

//			$.getJSON( moduleURL + "module.json", {}, function( config ) {

			//	module.config = config;
				module.model = new M();
				module.view = new V();
				module.controller = new C();


				module.dom = $( module.buildDom( ) );

				module.domContent = module.dom.children( ).children( '.ci-module-content' );
				module.domHeader = module.dom.children( ).children( '.ci-module-header' );
				module.domWrapper = module.dom;
		
				module.view.setModule( module );
				module.controller.setModule( module );
				module.model.setModule( module );

				module.view.onReady = true;

				module.view.init( );
				module.controller.init( );
				module.model.init( );
				
	 			module.updateAllView( );
				def.resolve();



	//		});
		
		});

		return def.promise();
	}

	 var Module = function(definition) {
		this.definition = definition;
		this.definition.configuration = this.definition.configuration || new ViewObject({});

		this.definition.layers = this.definition.layers || new ViewObject(); // View on which layers ?

		this.ready = init(this);
	};
	/**
	 * Overrideable prototype
	 */
	Module.prototype = {
		
		buildDom: function() {
			
			var html = "";
			html += '<div class="ci-module-wrapper ci-module-';
			html += this.controller.moduleInformation.cssClass;

		
			html += '" data-module-id="';
			html += this.definition.id;
			html += '"';

			html += ' style="z-index: ';
			html += this.definition.zindex || 0;
			html += '"';

			html += '><div class="ci-module"><div class="ci-module-header';
	
			
			html += '"><div class="ci-module-header-title">';
			html += this.definition.title;
			html += '</div>';
			html += '<div class="ci-module-header-toolbar">';
			html += '<ul>';
			
		
			html += '</ul>';
			html += '</div>';
			html += '</div><div class="ci-module-content" style="';
			
			if(this.definition.bgColor) {
				html += "background-color: ";
				html += "rgba(" + this.definition.bgColor + ")";
			} /*else if(entryCfg.moduleBackground) {
				html += "background-color: ";
				html += entryCfg.moduleBackground;
			}*/
			
			html += '">';
			
			html += '</div>';
			html += '</div>';
			return html;
		},

		/**
		 * Called to update the view (normally after a change of data)
		 */
		updateView: function(rel) {
		
			$.when(this.ready, this.view.onReady).then(function() {
				var val = API.getRepositoryData().get(this.getNameFromRel(rel)), name;
				if(!val)
					return;

				if(this.view.update && this.view.update[rel])
					this.view.update[rel].call(this.view, val[1], val[0][0]);	
			});
		},

		updateAllView: function() {
				
			if(!this.view.update || !this.definition) {
				return;
			}

			var vars = this.vars_in(),
				i = 0, 
				l = vars.length, 
				val;

			for( ; i < l ; i++ ) {
				
	 			val = API.getVar( vars[ i ].name );
	 			if( val.getType()!== "undefined" ) {	 				
	 				this.model.onVarGet( val, vars[ i ].name );
	 			}
			}
		},
		
		/** 
		 * Returns the DOM object which corresponds to the module's content
		 */
		getDomContent: function() {
			if(typeof this.domContent !== 'undefined')
				return this.domContent;
			throw "The module has not been loaded yet";
		},
		
		/** 
		 * Returns the DOM object which corresponds to the module's wrapper
		 */
		getDomWrapper: function() {

			if( typeof this.domWrapper !== 'undefined' ) {
				return this.domWrapper;
			}
			throw "The module has not been loaded yet";
		},
		
		/** 
		 * Returns the DOM object which corresponds to the module's view
		 */
		getDomView: function() {

			if( typeof this.view.getDom == 'function' ) {
				return this.view.getDom();
			}

			throw "The module's view doest not implement the getDom function";
		},
		
		/** 
		 * Returns the DOM object which corresponds to the module's header
		 */
		getDomHeader: function() {

			if( typeof this.domHeader !== 'undefined' ) {
				return this.domHeader;
			}

			throw "The module has not been loaded yet";
		},
		
		/**
		 * Returns all accepted types defined in the controller
		 */
		getAcceptedTypes: function( rel ) {

			var accept = this.controller.references;
			if( accept ) {
				return accept[ rel ];
			}
			return false;
			//return { data: rel, type: [], asObject: false };
		},
		
		
		getDataFromRel: function(rel) {

			if( ! this.model || ! this.model.data ) {
				return;
			}
			
			return this.model.data[ this.getNameFromRel( rel ) ] || false;
		},

		getNameFromRel: function(rel) {

			var vars = this.vars_in(),
				i = 0,
				l = vars.length;

			for( ; i < l ; i ++ ) {
				if( vars[ i ].rel == rel) {
					return vars[ i ].name;
				}
			}

			return false;
		},
		
		getData: function() {
			return this.model.data;
		},
		
		getDataRelFromName: function(name) {

			var vars = this.vars_in(),
				i = 0,
				l = vars.length,
				rels = [];

			for( ; i < l ; i ++ ) {
				if( vars[ i ].name == name) {
					rels.push( vars[ i ].rel );
				}
			}

			return rels;
		},

		getActionRelFromName: function(name) {

			var vars = this.actions_in(),
				i = 0,
				l = vars.length;

			for( ; i < l ; i ++ ) {
				if( vars[ i ].name == name) {
					return vars[ i ].rel;
				}
			}

			return false;
		},

		inDom: function() {

			this.view.inDom( );
			this.controller.inDom( );
			this.model.inDom( );
			
			var self = this;
                        
			if( ! API.isViewLocked() ) {

				ContextMenu.listen(this.getDomWrapper().get(0), [
					
					['<li><a><span class="ui-icon ui-icon-arrow-4-diag"></span> Fullscreen</a></li>', 
					function() {
						self.enableFullscreen();
					}],

					['<li><a><span class="ui-icon ui-icon-suitcase"></span> Export</a></li>', 
					function() {
						self.exportData();
					}],
	                
					['<li><a><span class="ui-icon ui-icon-print"></span> Print</a></li>', 
					function() {
						self.printView();
					}],
					
					['<li><a><span class="ui-icon ui-icon-gear"></span> Parameters</a></li>', 
					function() {
						self.doConfig();
					}]
				]);

			}
		},
		
		enableFullscreen: function() {
			Fullscreen.requestFullscreen(this);
		},
		
		toggleLayer: function( newLayerShown, layerOut ) {

			var layer;
			if( layer = this.getActiveLayer( newLayerShown )) {


				if( ! layer.display ) {
					
					this.hide();
				//	console.log('Hide');
					return;
				} else {
					this.show();
				//	console.log('Show');
					
				}



				this.setTitle( layer.title );
				this.setDisplayWrapper( layer.wrapper );
				this.setBackgroundColor( layer.bgcolor || [255,255,255,1] );

				this.activeLayerName = newLayerShown;

				return layer;
			}
		},

		eachLayer: function( callback ) {

			for( var i in this.definition.layers ) {
				callback( this.definition.layers[ i ], i );	
			}
		},

		setLayers: function( layers, blankLayer ) {
			this.definition.layers = this.definition.layers || new ViewObject();

			for( var i in layers ) {
				if( this.definition.layers[ i ] ) {
					continue;
				}
//console.log()
				// new layer
				this.definition.layers[ i ] = {};

				if( blankLayer ) {
					$.extend( true, this.definition.layers[ i ], Module.prototype.emptyConfig );	
					this.definition.layers[ i ].name = i;
				} else {
					$.extend( true, this.definition.layers[ i ], this.getActiveLayer( this.getActiveLayerName() ) );	
				}
				
				console.log( this.definition.layers );
			}
		},

		getActiveLayerName: function() {
			return this.activeLayerName;
		},

		getActiveLayer: function( activeLayer, noCreation ) {

			if( ! activeLayer ) {
				return false;
			}
//console.log( this.definition.layers )

			if( ! this.definition.layers[ activeLayer ] || ! this.definition.layers[ activeLayer ].created ) {

				if( noCreation ) {
					return false;
				}

				this.definition.layers[ activeLayer ] = new ViewObject(Module.prototype.emptyConfig,  true);
				this.definition.layers[ activeLayer ].name = activeLayer;

				//console.log( this.definition.layers[ activeLayer ] );

			}

			return this.definition.layers[ activeLayer ];
		},

		hide: function() {
			this.getDomWrapper().hide();
		},

		show: function() {
			this.getDomWrapper().show();
		},

		doConfig: function() {

			var module = this;
		
			var div = $('<div></div>').dialog({ modal: true, position: ['center', 50], width: '80%', title: "Edit module preferences"});


			div.prev().remove();
			div.parent().css('z-index', 1000);


			var references = this.controller.references,
				events = this.controller.events,
				i = 0,
				l;

			// Filters
			var filter = API.getAllFilters(),
				allFilters;

			function makeFilters( arraySource ) {

				if( ! arraySource ) {
					return;
				}

				var i = 0,
					l = arraySource.length,
					target = [];

				if( Array.isArray( arraySource ) ) {
					for( ; i < l ; i ++ ) {

						target.push( {
							key: require.toUrl(arraySource[ i ].file),
							title: arraySource[ i ].name,
							children: makeFilters( arraySource[ i ].children )
						} );		
					}
				}

				return target;
			}

			allFilters = makeFilters( filter );
			

			// AUTOCOMPLETE VARIABLES
			var autoCompleteVariables = [],
				keys = API.getRepositoryData().getKeys(),
				i = 0,
				l = keys.length;

			for( ; i < l; i++ ) {
				autoCompleteVariables.push({title: keys[i], label: keys[i]});
			}



			// AUTOCOMPLETE ACTIONS
			var autoCompleteActions = [],
				keys = API.getRepositoryActions().getKeys(),
				i = 0,
				l = keys.length;

			for( ; i < l; i++ ) {
				autoCompleteActions.push({title: keys[i], label: keys[i]});
			}




			
			// Receive configuration
			var varsIn = module.controller.variablesIn,
				varsInList = [];

			for( i = 0, l = varsIn.length ; i < l ; i ++ ) {
				
				if( ! references[ varsIn [ i ] ] ) {
					continue;
				}
				
				varsInList.push( { key: varsIn[ i ], title: references[ varsIn [ i ] ].label } )
			}

			// Send configuration
			var temporary = {}, 
				alljpaths = [];

			

			var makeSendJpaths = function() {	
			
				for( var i in references ) {
					alljpaths[ i ] = module.model.getjPath( i, temporary );
				}
			}

			makeSendJpaths();



			var makeReferences = function( event, type ) {

				var referenceList,
					i = 0,
					l,
					list = [];

				if( ! events[ event ] ) {
					return {};
				}

				switch( type ) {
					case 'event':
						referenceList = events[ event ].refVariable || [];
					break;

					case 'action':
						referenceList = events[ event ].refAction || [];
					break;
				}


				for( l = referenceList.length ; i < l ; i ++ ) {
					list.push( { key: referenceList[ i ], title: references[ referenceList [ i ] ].label } );
				}

				return list;
			}

			// VARIABLES OUT
			// ACTIONS OUT
			var eventsVariables = [],
				eventsActions = [];

			for( i in events ) {

				// If this event can send a variable
				if( events[ i ].refVariable ) {

					eventsVariables.push( { 
						title: events[i].label, key: i 
					} );
				}


				// If this event can send an action
				if( events[ i ].refAction ) {

					eventsActions.push( { 
						title: events[i].label, key: i 
					} );
				}
			}

			// ACTIONS IN
			var actionsIn = this.controller.actionsIn || {},
				actionsInList = [];	

			for( i in actionsIn ) {
				actionsInList.push({ title: actionsIn[ i ], key: i});
			}

			var allLayers = {};
			module.eachLayer( function( layer, key ) {
				allLayers[ key ] = key;
			} );

			require(['./forms/form'], function(Form) {

				var form = new Form({
				});

				form.init({
					onValueChanged: function( value ) {	}
				});

				var structure = {

					sections: {

						module_infos: {

							options: {
								title: 'Module informations',
								icon: 'info_rhombus'
							},

							groups: {

								group: {
									options: {
										type: 'text'
									}
								}
							}
						},


						module_config: {

							options: {
								title: 'General configuration',
								icon: 'page_white_paint'
							},


							groups: {
								layerDisplay: {
									options: {
										title: "Display on layers",
										type: 'list'
									},

									fields: {
										displayOn: {
											type: 'checkbox',
											title: 'Display on layers',
											options: allLayers
										}
									}
								}
							},

							sections: {

								layer: {

									options: {
										title: 'Shown on layers'
									},
								
									groups: {

										group: {
											options: {
												type: 'list',
												multiple: true,
												title: true
											},

											fields: {

												layerName: {
													type: 'text',
													multiple: false,
													title: 'Layer name',
													displayed: false
												},

												moduletitle: {
													type: 'text',
													multiple: false,
													title: 'Module title'
												},


												bgcolor: {
													type: 'color',
													multiple: false,
													title: 'Background color'
												},

												modulewrapper: {
													type: 'checkbox',
													title: 'Module boundaries',
													options: { 'display': '' }
												}
											}
										}
									}
								}
							}
						}
					}
				};


				var specificStructure = module.controller.configurationStructure( );


				if( specificStructure ) {

					structure.sections.module_specific_config = $.extend( specificStructure , {

						options: {
							title: 'Module configuration',
							icon: 'page_white_wrench'
						}
					});
				}


				if( varsInList.length > 0 ) {

					structure.sections.vars_in = {

						options: {
							title: 'Variables in',
							icon: 'basket_put'
						},

						groups: {

							group: {
								options: {
									type: 'table',
									multiple: true
								},

								fields: {

									rel: {
										type: 'combo',
										title: 'Reference',
										options: varsInList
									},

									name: {
										type: 'text',
										title: 'From variable',
										options: autoCompleteVariables
									}
								}
							}
						}
					}
				}
						
				if( eventsVariables.length > 0 ) {

					structure.sections.vars_out = {

						options: {
							title: 'Variables out',
							icon: 'basket_remove'
						},

						groups: {

							group: {
								options: {
									type: 'table',
									multiple: true
								},

								fields: {

									event: {
										type: 'combo',
										title: 'Event',
										options: eventsVariables
									},

									rel: {
										type: 'combo',
										title: 'Reference'
									},

									jpath: {
										type: 'combo',
										title: 'jPath',
										options: {}
									},


									filter: {
										type: 'combo',
										title: 'Filter variable',
										options: allFilters
									},

									name: {
										type: 'text',
										title: 'To variable'
									}
								}
							}
						}
					}
				}

				if( actionsInList.length > 0 ) {

					structure.sections.actions_in = {

						options: {
							title: 'Actions in',
							icon: 'door_in'
						},

						groups: {

							group: {

								options: {
									type: 'table',
									multiple: true
								},

								fields: {

									rel: {
										type: 'combo',
										title: 'Reference',
										options: actionsInList
									},

									name: {
										type: 'text',
										title: 'Action name',
										options: autoCompleteActions
									}
								}
							}
						}
					}
				}

				if( eventsActions.length > 0 ) {

					structure.sections.actions_out = {

						options: {
							title: 'Actions out',
							icon: 'door_out'
						},

						groups: {

							group: {
								options: {
									type: 'table',
									multiple: true
								},

								fields: {

									event: {
										type: 'combo',
										title: 'On event',
										options: eventsActions
									},

									rel: {
										type: 'combo',
										title: 'Reference',
									},

									jpath: {
										type: 'combo',
										title: 'jPath',
										options: {}
									},

									name: {
										type: 'text',
										title: 'Action name'
									}
								}
							}
						}
					}
				}

				form.setStructure( structure );

				form.onStructureLoaded().done(function() {

					/*var varReceiveChanged = function(name, rel) {
						if(name) {
							temporary[rel] = API.getVar(name);
							makeSendJpaths();
						}

						if( module.controller.onVarReceiveChange ) {
							module.controller.onVarReceiveChange( name , rel , form.getSection( 'moduleconfiguration' ) );
						}
					}*/

					if( form.getSection( 'vars_out' ) ) {
						form.getSection( 'vars_out' ).getGroup( 'group' ).getField( 'event' ).options.onChange = function( fieldElement ) {

							if( ! fieldElement.groupElement ) {
								return;
							}

							$.when(fieldElement
									.groupElement
									.getFieldElementCorrespondingTo(fieldElement, 'rel')).then( function( el ) {

										if( el ) {

											el.setOptions( makeReferences( fieldElement.value, 'event' ) );
										}
									});
						};


						form.getSection( 'vars_out' ).getGroup( 'group' ).getField( 'rel' ).options.onChange = function( fieldElement ) {

							if( ! fieldElement.groupElement ) {
								return;
							}

							$.when(fieldElement
									.groupElement
									.getFieldElementCorrespondingTo(fieldElement, 'jpath')).then( function( el ) {

										if( el ) {
											el.setOptions( alljpaths[ fieldElement.value ] );
										}
									});
						};
					}

					if( form.getSection( 'actions_out' ) ) {

						form.getSection( 'actions_out' ).getGroup( 'group' ).getField( 'event' ).options.onChange = function( fieldElement ) {						

							if( ! fieldElement.groupElement ) {
								return;
							}

							$.when(fieldElement
									.groupElement
									.getFieldElementCorrespondingTo(fieldElement, 'rel')).then( function( el ) {

										if( el ) {
											el.setOptions( makeReferences( fieldElement.value, 'action' ) );
										}
									});
						};

						form.getSection( 'actions_out' ).getGroup( 'group' ).getField( 'rel' ).options.onChange = function( fieldElement ) {						

							if( ! fieldElement.groupElement ) {
								return;
							}

							$.when(fieldElement
								.groupElement
								.getFieldElementCorrespondingTo(fieldElement, 'jpath')).then( function ( el ) {

									if( el ) {
										el.setOptions( alljpaths[ fieldElement.value ] );	
									}
								});
						};
					}

					var moduleInfosHtml = 
						'<table class="moduleInformation">' + 
						"<tr><td>Module name</td><td>" + module.controller.moduleInformation.moduleName + "</td></tr>" + 
						"<tr><td></td><td><small>" + module.controller.moduleInformation.description + "</small></td></tr>" + 
						"<tr><td>Module author</td><td>" + module.controller.moduleInformation.author + "</td></tr>" + 
						"<tr><td>Creation date</td><td>" + module.controller.moduleInformation.date + "</td></tr>" + 
						"<tr><td>Released under</td><td>" + module.controller.moduleInformation.license + "</td></tr>" +
						"</table>"
					;
					

					var allLayers = [],
						allLayerDisplay = [];

					module.eachLayer( function( layer, name ) {

						if( layer.display ) {
							allLayerDisplay.push( name );
						}
						
						allLayers.push({ 
							_title: name,
							layerName: [ name ],
							moduletitle: [ layer.title ],
							bgcolor: [ layer.bgColor || [ 255, 255, 255, 0 ] ],
							modulewrapper: [ ( layer.wrapper === true || layer.wrapper === undefined ) ? 'display' : '' ]
						});
					} ); 

					var fill = {
						sections: {
							module_config: [ { groups: { layerDisplay: [ { displayOn: [ allLayerDisplay ]} ] }, sections: { layer: [ { groups: { group: allLayers } }]  } } ],

							module_infos: [ { groups: { group: [ moduleInfosHtml ] } } ],
							module_specific_config: [ module.definition.configuration || {} ],

							vars_out: [ { groups: { group: [ module.vars_out() ] } } ],
							vars_in: [ { groups: { group: [ module.vars_in() ] } } ],
							actions_in: [ { groups: { group: [ module.actions_in() ] } } ],
							actions_out: [ { groups: { group: [ module.actions_out() ]}} ]
						}
					}


					form.fill( fill );

				});

				form.addButton('Cancel', { color: 'blue' }, function() {
					div.dialog( 'close' );
				});

				form.addButton('Save', { color: 'green' }, function() {

					var value = form.getValue().sections;

			//		module.setTitle( value.module_config[ 0 ].groups.group[ 0 ].moduletitle[ 0 ] );
				//	module.definition.bgColor 			= value.module_config[ 0 ].groups.group[ 0 ].bgcolor[ 0 ];
//					module.setBackgroundColor( module.definition.bgColor );

					module.definition.layers = module.definition.layers || {};
					console.log( value.module_config[ 0 ].sections.layer[ 0 ] );
					var l = value.module_config[ 0 ].sections.layer[ 0 ].groups.group;

					var allDisplay = value.module_config[ 0 ].groups.layerDisplay[ 0 ].displayOn[ 0 ];

					for( var i = 0, ll = l.length ; i < ll ; i ++ ) {

						//console.log( l[ i ].groups.group[ 0 ].layerName[ 0 ], allDisplay, allDisplay.indexOf( l[ i ].groups.group[ 0 ].layerName[ 0 ] ) );


						module.definition.layers[ l[ i ].layerName[ 0 ] ].display = allDisplay.indexOf( l[ i ].layerName[ 0 ] ) > -1;
						module.definition.layers[ l[ i ].layerName[ 0 ] ].title = l[ i ].moduletitle[ 0 ];
						module.definition.layers[ l[ i ].layerName[ 0 ] ].bgcolor = l[ i ].bgcolor;
						module.definition.layers[ l[ i ].layerName[ 0 ] ].wrapper = l[ i ].modulewrapper[ 0 ].indexOf('display') > -1;
					}


					if( value.vars_out ) {
						module.setSendVars(		value.vars_out[ 0 ].groups.group[ 0 ]			);
					}

					if( value.vars_in ) {
						module.setSourceVars(	value.vars_in[ 0 ].groups.group[ 0 ]			);
					}

					if( value.actions_in ) {
						module.setActionsIn(	value.actions_in[ 0 ].groups.group[ 0 ]			);
					}

					if( value.actions_out ) {
						module.setActionsOut(	value.actions_out[ 0 ].groups.group[ 0 ]		);
					}


					if( value.module_specific_config ) {
						module.definition.configuration =	value.module_specific_config[ 0 ];
					}

					if( module.view.unload ) {
						module.view.unload();
					}
						
					module.toggleLayer( module.getActiveLayerName() );

					module.view.init();

					module.view.inDom();

					module.view.onResize( );

					module.model.resetListeners( );

					module.updateAllView( );

					div.dialog('close');
					document.getElementById('header').scrollIntoView( true );
				});

				form.onLoaded().done(function() {

					div.html(form.makeDom());
					form.inDom();
				});
			});
		},


		getConfiguration: function( aliasName, fallbackValue ) {


			var cfgEl = this.definition.configuration,
				alias = this.controller.configAliases[ aliasName ],
                                toReturn;


			if( alias ) {

				for( var i = 0, l = alias.length ; i < l ; i ++) {
					cfgEl = cfgEl[ alias[ i ] ];

					if( typeof cfgEl === 'undefined' ) {

						toReturn = this._getConfigurationDefault( alias, aliasName );
                                                break;
					}
				}
			} else {
				console.warn( 'Alias ' + alias + ' not defined ');
				console.trace();
			}
			if(typeof toReturn === "undefined")
                            toReturn = this._doConfigurationFunction( cfgEl, aliasName );
                        if(typeof toReturn === "undefined")
                            toReturn = fallbackValue;
                        
                        return toReturn;
                        
		},

		_getConfigurationDefault: function( alias, aliasName ) {

			this._cfgStructure = this._cfgStructure || this.controller.configurationStructure();

			var cfgEl = this._cfgStructure;

			for( var i = 0, l = alias.length ; i < l ; i ++) {

				if( typeof alias[ i ] == 'number') {
					continue;
				}

				if( cfgEl.fields ) {
					i--;
					cfgEl = cfgEl.fields;
					continue;
				}


				cfgEl = cfgEl[ alias[ i ] ];
				if( ! cfgEl ) {

					console.warn('Error in configuration file - Alias is not a correct jPath');
					return false;
				}

			}


			return this._doConfigurationFunction( cfgEl.default, aliasName );
		},

		_doConfigurationFunction: function( element, aliasName ) {

			if( this.controller.configFunctions[ aliasName ] ) {
				try {
					return this.controller.configFunctions[ aliasName ]( element );
				} catch( e ) {
					return element;
				}
			}

			return element;
		},

		/** 
		 * Returns the data for the module's model
		 */
		getValue: function() {
			if(typeof this.model.getValue == 'function')
				return this.model.getValue();
			
			return;
		},
		
		/** 
		 * Returns the current position of the module
		 */
		getPosition: function( activeLayer ) {
			
			var layer = this.getActiveLayer( activeLayer );
			return layer.position;
		},
		
		/** 
		 * Returns the current size of the module
		 */
		getSize: function( activeLayer ) {
			
			var layer = this.getActiveLayer( activeLayer );
			return layer.size;
		},

		getWidthPx: function() {
			return this.getDomContent().innerWidth();
		},

		getHeightPx: function() {
			return this.getDomContent().innerHeight();
		},
		
		getId: function() {
			return this.definition.id;
		},

		setId: function(id) {
			this.definition.set('id', id);
		},
		

		setSourceVars: function(vars) {
			this.definition.set('vars_in', vars, true);
		},
		
		setSendVars: function(vars) {
			this.definition.set('vars_out', vars, true);
			var i = 0,
				l = vars.length;

/*
			for( ; i < l ; i++ ) {
				if( vars[ i ].name ) {

					API.setVar( vars[ i ].name, API.getVar( vars[ i ].name ) );
				}
			}*/
		},
		
		setActionsIn: function(vars) {
			this.definition.set('actions_in', vars, true);
		},
		
		setActionsOut: function(vars) {
			this.definition.set('actions_out', vars, true);
		},

		vars_in: function() {

			// Backward compatibility
			if( ! this.definition.vars_in && this.definition.dataSource) {
				this.definition.vars_in = this.definition.dataSource;
				delete this.definition.dataSource;
			}

			return this.definition.vars_in = this.definition.vars_in || new ViewArray();
		},


		vars_out: function() {
			
			// Backward compatibility
			if( ! this.definition.vars_out && this.definition.dataSend) {
				this.definition.vars_out = this.definition.dataSend;
				delete this.definition.dataSend;
			}

			return this.definition.vars_out = this.definition.vars_out || {};
		},


		actions_in: function() {
			
			// Backward compatibility
			if( ! this.definition.actions_in && this.definition.actionsIn) {
				this.definition.actions_in = this.definition.actionsIn;
				delete this.definition.actionsIn;
			}

			return this.definition.actions_in = this.definition.actions_in || {};
		},


		actions_out: function() {
			
			// Backward compatibility
			if( ! this.definition.actions_out && this.definition.actionsOut) {
				this.definition.actions_out = this.definition.actionsOut;
				delete this.definition.actionsOut;
			}

			return this.definition.actions_out = this.definition.actions_out || {};
		},
		
		getDefinition: function() {
			return this.definition;
		},
		
		getTitle: function() {
			return this.definition.title;
		},
		
		setTitle: function(title) {
			this.definition.set('title', title);
			this.domHeader.find('.ci-module-header-title').text(title);
		},

		exportData: function() {
			var module = this;
			$('<div class="ci-module-export"><textarea></textarea></div>').dialog({
				'modal': true,
				'title': 'Export data from module ' + module.getTitle(),
				'width': '70%',
				height: 500
			}).children('textarea').text(module.controller["export"]());
		},
		
		printView: function() {
			var openWindow = window.open("", "", "");
			this.controller["print"](openWindow);
			openWindow.document.close();
			openWindow.focus();
			openWindow.print();
			openWindow.close();
		},

		setBackgroundColor: function(color) {
			this.domContent.get(0).style.backgroundColor = 'rgba(' + color.join(",") + ')';
		},

		setDisplayWrapper: function( bln ) {

			this.getDomWrapper()[(bln === true || bln == undefined) ? 'addClass' : 'removeClass']('ci-module-displaywrapper');
			
			try {
				this.getDomWrapper().resizable((bln === true || bln == undefined) ? 'enable' : 'disable');
			} catch(e) {}; 
		},

		emptyConfig: {
				position: { left: 0, top: 0 },
				size: { width: 20, height: 20},
				zIndex: 0,
				display: true, 
				title: "",
				bgcolor: [ 255, 255, 255, 0 ],
				wrapper: true,
				created: true
		}
	};

	return Module;
});