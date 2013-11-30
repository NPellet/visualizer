
define(['jquery', 'util/context', 'util/api', 'forms/button', 'util/util'], function($, ContextMenu, API, Button, Util) {
	
	function init(module) {
		//define object properties
		var moduleType = module.definition.type, def = $.Deferred();
		
		//Construct the DOM within the module
		module.dom = $( module.buildDom( ) );

		module.domContent = module.dom.children( ).children( '.ci-module-content' );
		module.domHeader = module.dom.children( ).children( '.ci-module-header' );
		module.domWrapper = module.dom;
	
		Util.loadCss( require.toUrl( 'modules/types/' + moduleType + '/style.css' ) );

		if( ! moduleType ) {
			def.reject( );
			return def;
		}

		require(['modules/types/' + moduleType + '/model', 'modules/types/' + moduleType + '/view', 'modules/types/' + moduleType + '/controller'], function(M, V, C) {

			module.model = new M();
			module.view = new V();
			module.controller = new C();

			module.view.setModule( module );
			module.controller.setModule( module );
			module.model.setModule( module );

			module.view.onReady = true;

			module.view.init( );
			module.controller.init( );
			module.model.init( );
			
 			module.updateAllView( );
			def.resolve();
		});

		return def.promise();
	}

	 var Module = function(definition) {
		this.definition = definition;
		this.definition.configuration = this.definition.configuration || new ViewObject({});
		this.ready = init(this);
	};
	/**
	 * Overrideable prototype
	 */
	Module.prototype = {
		
		buildDom: function() {
			
			var html = "";
			html += '<div class="ci-module-wrapper ci-module-';
			html += this.definition.type;

		
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
	 			if( val ) {	 				
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
			if(typeof this.view.getDom == 'function')
				return this.view.getDom();
			throw "The module's view doest not implement the getDom function";
		},
		
		/** 
		 * Returns the DOM object which corresponds to the module's header
		 */
		getDomHeader: function() {
			if(typeof this.domHeader !== 'undefined')
				return this.domHeader;
			throw "The module has not been loaded yet";
		},
		
		/**
		 * Returns all accepted types defined in the controller
		 */
		getAcceptedTypes: function(rel) {
			var accept = this.controller.configurationReceive;
			if( accept[ rel ] ) {
				return accept[ rel ];
			}
			return { data: rel, type: [], asObject: false };
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

			if(this.view.inDom) {
				this.view.inDom();
			}

			if(this.controller.inDom) {
				this.controller.inDom();
			}

			if(this.model.inDom) {
				this.model.inDom();
			}

			var self = this;

			ContextMenu.listen(this.getDomWrapper().get(0), [

				['<li><a><span class="ui-icon ui-icon-suitcase"></span> Export</a></li>', 
				function() {
					self.exportData();
				}],
				
				['<li><a><span class="ui-icon ui-icon-gear"></span> Parameters</a></li>', 
				function() {
					self.doConfig();
				}]
			]);

			this.setDisplayWrapper();
		},
		

		doConfig: function() {

			var module = this;
		
			var div = $('<div></div>').dialog({ modal: true, position: ['center', 50], width: '80%', title: "Edit module preferences"});


			div.prev().remove();
			div.parent().css('z-index', 1000);

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
			var availCfg = module.controller.configurationReceive;
			var allRels2 = [];
			for(var i in availCfg)
				allRels2.push({ key: i, title: availCfg[i].label });

			// Send configuration
			var temporary = {}, 
				sendjpaths = [];

			var availCfg = module.controller.configurationSend;
			var makeSendJpaths = function() {	
				sendjpaths = {};
				for(var i in availCfg.rels)
					sendjpaths[i] = module.model.getjPath(i, temporary);
			}

			
			makeSendJpaths();
			
			var allEvents = [];
			for(var i in availCfg.events)
				allEvents.push({title: availCfg.events[i].label, key: i});
			
			var allRels = [];
			for(var i in availCfg.rels)
				allRels.push({ title: availCfg.rels[i].label, key: i})
		
			var actionsCfg = module.controller.actions;
			var allActionsRels = [];
			if(actionsCfg)
				for(var i in actionsCfg.rel)
					allActionsRels.push({ title: actionsCfg.rel[i], key: i});

			var actionsReceive = module.controller.actionsReceive || {};
			var allActionsReceive = [];	
			for(var i in actionsReceive)
				allActionsReceive.push({ title: actionsReceive[i], key: i});
			

			require(['./libs/forms2/form'], function(Form) {

				var form = new Form({
				});

				form.init({
					onValueChanged: function( value ) {	}
				});

				form.setStructure({

					sections: {

						module_config: {

							options: {
								title: 'General configuration',
								icon: 'page_white_paint'
							},

							groups: {

								group: {
									options: {
										type: 'list',
										multiple: true
									},

									fields: {

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
											options: {'display': ''}
										}
									}
								}
							}
						},


						module_specific_config: 

							$.extend( module.controller.configurationStructure( ), {
								options: {
									title: 'Module configuration',
									icon: 'page_white_wrench'
								}
							}),

						vars_in: {

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
											options: allRels2,
											title: 'Reference'
										},

										name: {
											type: 'text',
											title: 'From variable',
											options: autoCompleteVariables
										}
									}
								}
							}
						},


						vars_out: {

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
											options: allEvents
										},

										rel: {
											type: 'combo',
											title: 'Internal ref.',
											options: allRels
										},

										jpath: {
											type: 'combo',
											title: 'jPath',
											options: {}
										},

										name: {
											type: 'text',
											title: 'To variable'
										}
									}
								}
							}
						},


						actions_in: {

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
											options: allActionsReceive
										},

										name: {
											type: 'text',
											title: 'Action name',
											options: autoCompleteActions
										}
									}
								}
							}
						},


						actions_out: {

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
											options: allEvents
										},

										rel: {
											type: 'combo',
											title: 'Reference',
											options: allActionsRels,
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
				});


	
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


					form.getSection( 'vars_out' ).getGroup( 'group' ).getField( 'rel' ).options.onChange = function( fieldElement ) {

						if( ! fieldElement.groupElement ) {
							return;
						}

						$.when(fieldElement
								.groupElement
								.getFieldElementCorrespondingTo(fieldElement, 'jpath')).then( function( el ) {

									if( el ) {
										el.setOptions( sendjpaths[ fieldElement.value ] );
									}
								});
					};

/*
					form.getSection( 'vars_in' ).getGroup( 'group' ).getField( 'rel' ).options.onChange = function( fieldElement ) {

						if( ! fieldElement.groupElement ) {
							return;
						}

						varReceiveChanged(
							fieldElement.groupElement.getFieldElementCorrespondingTo( fieldElement, 'name' ).value,
							this.value
						);

					};

					form.getSection( 'vars_in' ).getGroup( 'group' ).getField( 'name' ).options.onChange = function( fieldElement ) {

						if( ! fieldElement.groupElement ) {
							return;
						}

						varReceiveChanged(
							this.value,
							fieldElement.groupElement.getFieldElementCorrespondingTo( fieldElement, 'rel' ).value
						);
					};
*/

					form.getSection( 'actions_out' ).getGroup( 'group' ).getField( 'rel' ).options.onChange = function( fieldElement ) {						

						if( ! fieldElement.groupElement ) {
							return;
						}

						$.when(fieldElement
							.groupElement
							.getFieldElementCorrespondingTo(fieldElement, 'jpath')).then( function ( el ) {

								if( el ) {
									el.setOptions( sendjpaths[ fieldElement.value ] );	
								}
							});
					};

/*
					var sentVars = { event: [], rel: [], jpath: [], name: []};	
					if(module.definition.dataSend) {
						var currentCfg = module.definition.dataSend;
						for(var i = 0; i < currentCfg.length; i++) {
							sentVars.event.push(currentCfg[i].event);
							sentVars.rel.push(currentCfg[i].rel);
							sentVars.jpath.push(currentCfg[i].jpath);
							sentVars.name.push(currentCfg[i].name);
						}
					}
					
					var receivedVars = { rel: [], name: []};
					if(module.definition.dataSource) {
						var currentCfg = module.definition.dataSource;
						for(var i = 0; i < currentCfg.length; i++) {
							receivedVars.rel.push(currentCfg[i].rel);
							receivedVars.name.push(currentCfg[i].name);
							if(module.controller.fillReceivedVars)
								module.controller.fillReceivedVars(receivedVars, currentCfg[i], i);
						}
					}

					var actionsin = { rel: [], name: []};
					if(module.definition.actionsIn) {
						var currentCfg = module.definition.actionsIn;
						for(var i = 0; i < currentCfg.length; i++) {
							actionsin.rel.push(currentCfg[i].rel);
							actionsin.name.push(currentCfg[i].name);
						}
					}


					var actionsout = { event: [], rel: [], name: [], jpath: []};
					if(module.definition.actionsOut) {
						var currentCfg = module.definition.actionsOut;
						for(var i = 0; i < currentCfg.length; i++) {
							actionsout.rel.push(currentCfg[i].rel);
							actionsout.name.push(currentCfg[i].name);
							actionsout.jpath.push(currentCfg[i].jpath);
							actionsout.event.push(currentCfg[i].event);
						}
					}
					*/


					var fill = {
						sections: {
							module_config: [ { groups: { group: [{ moduletitle: [module.getTitle()], bgcolor: [ module.definition.bgColor || [ 255, 255, 255, 0 ] ],  modulewrapper: [[ (module.definition.displayWrapper === true || module.definition.displayWrapper == undefined) ? 'display' : '' ]] }] } } ],
							module_specific_config: [ module.definition.configuration || {} ],

							vars_out: [ { groups: { group: [ module.vars_out() ] } } ],
							vars_in: [ { groups: { group: [ module.vars_in() ] } } ],
							actions_in: [ { groups: { group: [ module.actions_in() ] } } ],
							actions_out: [ { groups: { group: [ module.actions_out() ]}} ]
						}
					}

					form.fill(fill);

				});

				form.addButton('Cancel', { color: 'blue' }, function() {
					div.dialog( 'close' );
				});

				form.addButton('Save', { color: 'green' }, function() {

					var value = form.getValue().sections;

					module.setTitle( value.module_config[ 0 ].groups.group[ 0 ].moduletitle[ 0 ] );
					module.definition.bgColor 			= value.module_config[ 0 ].groups.group[ 0 ].bgcolor[ 0 ];
					module.setBackgroundColor( module.definition.bgColor );

					module.definition.displayWrapper 	= value.module_config[ 0 ].groups.group[ 0 ].modulewrapper[ 0 ].indexOf('display') > -1;
					module.setDisplayWrapper();

					module.setSendVars(		value.vars_out[ 0 ].groups.group[ 0 ]			);
					module.setSourceVars(	value.vars_in[ 0 ].groups.group[ 0 ]			);
					module.setActionsIn(	value.actions_in[ 0 ].groups.group[ 0 ]			);
					module.setActionsOut(	value.actions_out[ 0 ].groups.group[ 0 ]		);

					module.definition.configuration =	value.module_specific_config[ 0 ];

					if( module.view.unload ) {
						module.view.unload();
					}
					
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


		getConfiguration: function( aliasName ) {


			var cfgEl = this.definition.configuration,
				alias = this.controller.configAliases[ aliasName ];


			if( alias ) {

				for( var i = 0, l = alias.length ; i < l ; i ++) {
					cfgEl = cfgEl[ alias[ i ] ];

					if( typeof cfgEl == 'undefined' ) {

						return this._getConfigurationDefault( alias, aliasName );
					}
				}
			} else {
				console.warn( 'Alias ' + alias + ' not defined ');
				console.trace();
			}
			

			return this._doConfigurationFunction( cfgEl, aliasName );
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

					return 'Error in configuration file - Alias is not a correct jPath';
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
		getPosition: function() {
			
			if(!this.definition.position)
				this.definition.position = { left: 0, right: 0};
			return this.definition.position;
		},
		
		/** 
		 * Returns the current size of the module
		 */
		getSize: function() {
			
			if(!this.definition.size)
				this.definition.size = new ViewObject({ width: 20, height: 20});
				
			return this.definition.size;
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

			return this.definition.vars_in = this.definition.vars_in || {};
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

		setBackgroundColor: function(color) {
			this.domContent.get(0).style.backgroundColor = 'rgba(' + color + ')';
		},

		setDisplayWrapper: function() {
			var bln = this.definition.displayWrapper;
			this.getDomWrapper()[(bln === true || bln == undefined) ? 'addClass' : 'removeClass']('ci-module-displaywrapper');
			
			try {
				this.getDomWrapper().resizable((bln === true || bln == undefined) ? 'enable' : 'disable');
			} catch(e) {}; 
		}
	};

	return Module;
});