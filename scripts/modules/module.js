
define(['jquery', 'util/context', 'util/api', 'forms/button2', 'util/util'], function($, ContextMenu, API, Button, Util) {
	
	function init(module) {
		//define object properties
		var moduleType = module.definition.type, def = $.Deferred();
		
		//Construct the DOM within the module
		module.dom = $(module.buildDom());
		module.domContent = module.dom.children().children('.ci-module-content');
		module.domHeader = module.dom.children().children('.ci-module-header');
		module.domWrapper = module.dom;
	
		Util.loadCss(require.toUrl('modules/types/' + moduleType + '/style.css'));

		require(['modules/types/' + moduleType + '/model', 'modules/types/' + moduleType + '/view', 'modules/types/' + moduleType + '/controller'], function(M, V, C) {
			module.model = new M();
			module.view = new V();
			module.controller = new C();

			module.view.setModule(module);
			module.controller.setModule(module);
			module.model.setModule(module);

			module.view.init();
			module.controller.init();
			module.model.init();
			
 			module.updateAllView();

			def.resolve();
		});

		return def;
	}

	 var Module = function(definition) {
		this.definition = definition;
		this.definition.configuration = this.definition.configuration || {};
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
				html += this.definition.bgColor;
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
		
			var val = API.getRepositoryData().get(this.getNameFromRel(rel)), name;
			if(!val)
				return;
console.log(val);
			if(this.view.update && this.view.update[rel])
				this.view.update[rel].call(this.view, val[1], val[0][0]);
		},

		updateAllView: function() {
				
			if(!this.view.update || !this.definition || !this.definition.dataSource)
				return;

			for(var i = 0, l = this.definition.dataSource.length; i < l; i++) {
	 			var val = API.getRepositoryData().get(this.definition.dataSource[i].name);

	 			if(val && val[1])
	 				this.model.onVarGet(val[1], this.definition.dataSource[i].name);
//					this.view.update[this.definition.dataSource[i].rel].call(this.view, val[1], this.definition.dataSource[i].name);
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
			if(typeof this.domWrapper !== 'undefined')
				return this.domWrapper;
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
		 * Returns the configuration of the module
		 */
		getConfiguration: function() {
			return this.definition.configuration;
		},
		
		
		/**
		 * Returns all accepted types defined in the controller
		 */
		getAcceptedTypes: function(rel) {
			var accept = this.controller.configurationReceive;
			if(accept[rel])
				return accept[rel];
			return { data: rel, type: [], asObject: false };
		},
		
		
		getDataFromRel: function(rel) {

			for(var i in this.definition.dataSource)
				if(this.definition.dataSource[i].rel == rel) {
					return this.model.data[this.definition.dataSource[i].name];
				}
			return false;
		},

		getNameFromRel: function(rel) {
			for(var i in this.definition.dataSource)
				if(this.definition.dataSource[i].rel == rel)
					return this.definition.dataSource[i].name;
			return false;
		},
		
		getData: function() {
			return this.model.data;
		},
		
		getDataRelFromName: function(name) {
			var rels = [];
			for(var i in this.definition.dataSource)
				if(this.definition.dataSource[i].name == name)
					rels.push(this.definition.dataSource[i].rel);
			return rels;
		},

		getActionRelFromName: function(name) {
			for(var i in this.definition.actionsIn)
				if(this.definition.actionsIn[i].name == name)
					return this.definition.actionsIn[i].rel;
			return false;
		},

		inDom: function() {

			if(this.view.inDom)
				this.view.inDom();

			if(this.controller.inDom)
				this.controller.inDom();

			if(this.model.inDom)
				this.model.inDom();

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
			require(['forms/formfactory', 'jqueryui'], function(FormFactory, jqueryui) {

				var div = $('<div></div>').dialog({ modal: true, width: '80%', title: "Edit module preferences"});
				div.parent().css('z-index', 1000);

				var autoComplete = [];
				var keys = API.getRepositoryData().getKeys();

				for(var i = 0, l = keys.length; i < l; i++)
					autoComplete.push({title: keys[i], label: keys[i]});
				
				// Receive configuration
				var availCfg = module.controller.configurationReceive;
				var allRels2 = [];
				for(var i in availCfg)
					allRels2.push({ key: i, title: availCfg[i].label });

				// Send configuration
				var availCfg = module.controller.configurationSend;
				var sendjpaths = [];
				for(var i in availCfg.rels)
					sendjpaths[i] = module.model.getjPath(i);
				
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
				


				FormFactory.newform(div, {
					sections: {
						'general': {
							config: {
								multiple: false,
								title: 'General Configuration'
							},

							groups: {
								'general': {
									config: {
										type: 'list'
									},

									fields: [

										{
											type: 'Text',
											name: 'moduletitle',
											multiple: false,
											title: 'Module title'
										},

										{
											type: 'Color',
											name: 'bgcolor',
											multiple: false,
											title: 'Background color'
										},

										{
											type: 'Checkbox',
											name: 'modulewrapper',
											title: 'Display module boundaries',
											options: {'display': ''}
										}
									]
								}
							}
						},

						'moduleconfiguration': $.extend(module.controller.doConfiguration() || {}, 	{
							config: {
								multiple: false,
								title: 'Module configuration'
							}
						}),

						'send': {
							config: {
								multiple: false,
								title: 'Variables Out'
							},

							groups: {
								'sentvars': {
									config: {
										type: 'table'
									},

									fields: [
										{
											type: 'Combo',
											name: 'event',
											title: 'Event',
											options: allEvents
										},

										{
											type: 'Combo',
											name: 'rel',
											title: 'Internal ref.',
											options: allRels
										},

										{
											type: 'Combo',
											name: 'jpath',
											title: 'jPath',
											options: {}
										},

										{
											type: 'Text',
											name: 'name',
											title: 'Variable name'
										}
									]
								}
							}

						},

						'receive': {
							config: {
								multiple: false,
								title: 'Variables In'
							},

							groups: {
								'receivedvars': {
									config: {
										type: 'table'
									},

									fields: [
										{
											type: 'Combo',
											name: 'rel',
											options: allRels2,
											title: 'Internal ref.'
										},
										{
											type: 'Text',
											name: 'name',
											title: 'Stores in variable',
											autoComplete: autoComplete
										}
									]
								}

							}
						},

						'actionsout': {
							config: {
								title: 'Actions Out'
							},

							groups: {
								'actions': {
									config: {
										type: 'table'
									},

									fields: [
										{
											type: 'Combo',
											name: 'event',
											title: 'Event',
											options: allEvents
										},

										{
											type: 'Combo',
											name: 'rel',
											title: 'Internal ref.',
											options: allRels,
										},

										{
											type: 'Combo',
											name: 'jpath',
											title: 'jPath',
											options: {}
										},

										{
											type: 'Text',
											name: 'name',
											title: 'Action name'
										}
									]
								}
							}
						},

						'actionsin': {
							config: {
								title: 'Actions In'
							},

							groups: {
								'actions': {
									config: {
										type: 'table'
									},

									fields: [
										{
											type: 'Combo',
											name: 'rel',
											title: 'Internal ref.',
											options: allActionsReceive
										},

										{
											type: 'Text',
											name: 'name',
											title: 'Action name'
										}
									]
								}

							}

						}
					}
				}, function(form) {

					form.getSection('send').getGroup('sentvars').getField('rel').onChange(function(index) {
						var value = this.getValue(index), 
						jpath = this.group.getField('jpath');
						if(!jpath)
							return;							
						jpath.implementation.setOptions(sendjpaths[value], index);
					});


					form.getSection('actionsout').getGroup('actions').getField('rel').onChange(function(index) {
						var value = this.getValue(index), 
						jpath = this.group.getField('jpath');
						if(!jpath)
							return;							
						jpath.implementation.setOptions(sendjpaths[value], index);
					});
				
					var save = new Button('Save', function() {
						form.dom.trigger('stopEditing');
						var value = form.getValue();

						module.setTitle(value.general[0].general[0].moduletitle[0]);
						module.definition.bgColor = value.general[0].general[0].bgcolor[0];
						module.definition.displayWrapper = !!value.general[0].general[0].modulewrapper[0][0];
						module.setBackgroundColor(value.general[0].general[0].bgcolor[0]);
						module.setDisplayWrapper();
						module.setSendVars(value.send[0].sentvars[0]);

						module.setSourceVars(value.receive[0].receivedvars[0]);
						module.setActionsIn(value.actionsin[0].actions[0]);
						module.setActionsOut(value.actionsout[0].actions[0]);
						if(module.controller.processReceivedVars)
							module.controller.processReceivedVars(value.receive[0].receivedvars[0]);
						if(module.controller.doSaveConfiguration) 
							module.controller.doSaveConfiguration(value.moduleconfiguration);
						module.view.init();
						module.view.inDom();
						module.model.resetListeners();	
						module.updateAllView();
						form.getDom().dialog('close');
						document.getElementById('ci-header').scrollIntoView(true);
					});
					
					save.setColor('blue');
					form.addButtonZone(save);
				

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
					
					var fill = {
						sections: {
							general: [ { groups: { general: [{ moduletitle: [module.getTitle()], bgcolor: [ module.definition.bgColor ],  modulewrapper: [[ (module.definition.displayWrapper === true || module.definition.displayWrapper == undefined) ? 'display' : '' ]] }] } } ],
							moduleconfiguration: [ module.controller.doFillConfiguration ? module.controller.doFillConfiguration() : []],
							send: [ { groups: {sentvars: [sentVars]}} ],
							receive: [ { groups: {receivedvars: [receivedVars]}} ],
							actionsin: [ { groups: {actions: [actionsin]}} ],
							actionsout: [ { groups: {actions: [actionsout]}} ]
						}
					}
					form.fillJson(fill);
					form.getDom().dialog('option', 'position', 'center');

				});
			});
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
				this.definition.size = { width: 20, height: 20};
				
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
			this.definition.id = id;
		},
		
		setSourceVars: function(vars) {
			this.definition.dataSource = vars;
		},
		
		setSendVars: function(vars) {
			this.definition.dataSend = vars;
		},
		
		setActionsIn: function(vars) {
			this.definition.actionsIn = vars;
		},
		
		setActionsOut: function(vars) {
			this.definition.actionsOut = vars;
		},
		
		getDefinition: function() {
			return this.definition;
		},
		
		getTitle: function() {
			
			return this.definition.title;
		},
		
		setTitle: function(title) {
			this.definition.title = title;
			this.domHeader.find('.ci-module-header-title').text(title);
		},

		exportData: function() {
			var module = this;
			$('<div class="ci-module-export"><textarea></textarea></div>').dialog({
				'title': 'Export data from module ' + module.getTitle(),
				'width': '70%',
				height: 500
			}).children('textarea').text(module.controller["export"]());
		},

		setBackgroundColor: function(color) {
			this.domContent.get(0).style.backgroundColor = color;
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