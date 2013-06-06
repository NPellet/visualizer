 /*
 * module.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

/**
 * modules is a HashMap, mapping module.id to the module
 * @see example in init.js
 */
CI.modules = {};

/**
 * Creates a new base Module
 * @class The base class for all Modules to extend
 * @param {object} definition An object containing options for the grid (is merged into {@link defaults})
 * @param {integer} [definition.id] The id of the module
 * @param {string} [definition.type] A string identifying the type of this module
 * @param {object} [definition.size] An object definining the size of the module (containing width and height)
 * @param {object} [definition.position] An object definining the position of the module (containing x and y)
 */
CI.Module = function(definition) {

	//this.definition = $.extend(true, definition, CI.Module.prototype.defaults);
	// WRONG ! We need to keep the pointer.
	this.definition = definition;
	
	this.id = ++CI.Module.prototype.lastId;
	CI.modules[this.id] = this;
	
	if(!definition.configuration)
		definition.configuration = {};
	this.cfgModule = definition.configuration;
	
	
	/**
	 * @function Initialises the module, constructs the DOM within the module, and initialises the MVC
	 */
	this.init = init;
	function init() {
		


		//define object properties
		var module = this;
		var moduleType = this.definition.type;
		
		//Construct the DOM within the module
		this.dom = $(this.buildDom());
		this.domContent = this.dom.children().children('.ci-module-content');
		this.domHeader = this.dom.children().children('.ci-module-header');
		this.domWrapper = this.dom;
		
		var moduleConstruct = CI.Module.prototype._types[moduleType];
		
		if(!(moduleConstruct && moduleConstruct.View && moduleConstruct.Controller && moduleConstruct.Model)) {
			throw 'Module ' + moduleType + ' not fully implemented';
			return;
		}
		
		//Initialises the MVC pattern for the module
		this.view = new CI.Module.prototype._types[moduleType].View(this);
		this.controller = new CI.Module.prototype._types[moduleType].Controller(this);
		this.model = new CI.Module.prototype._types[moduleType].Model(this);

		this.view.init(this);
		this.controller.init(this);
		this.model.init(this);
		/*
		if(this.controller["export"])
			this.dom.find('.ci-export').bind('click', function(event) {
				module.exportData();
			});
		else
			this.dom.find('.ci-export').hide();

		this.dom.find('.ci-configure').bind('click', function(event) {
			$(document).trigger('configModule', module);
		});
		
		this.dom.find('.ci-remove').bind('click', function(event) {
			Entry.removeModule(module);
		});*/

 		this.updateAllView();



	}
	
	/**
	 * Construct the basic dom for the module
	 */
	this.buildDom = buildDom;
	function buildDom() {
		
		var entryCfg = Entry.getConfiguration();
		
		var html = "";
		html += '<div class="ci-module-wrapper ci-module-';
		html += this.definition.type;

	
		html += '" data-module-id="';
		html += this.definition.id;
		html += '"><div class="ci-module"><div class="ci-module-header';
		if(entryCfg.showModuleHeaderOnHover)
			html += ' ci-hidden';
		
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
	}
	
	this.init();
};
/**
 * Overrideable prototype
 */
CI.Module.prototype = {
	
	/**
	 * Used to define default module properties. On creation, the definition passed is merged with this object 
	 * @type object
	 * @hide
	 */
	defaults: {
		id: -1,
		type: 'default',
		
		size: {
			width: 10,
			height: 15
		},
		
		position: {
			top: 0,
			left: 0
		}
	},

	lastId: 0,

	/**
	 * Contains the names of all types of module
	 */
	_types: {},
	
	
	/**
	 * Called when the data behind the module needs updating
	 * @param dataName The name of the piece of data being updated
	 * @param dataName The new value of the data being updated
	 */
	onDataChange: function(dataName, dataVal) {
		
		if(typeof this.model.onDataChange == 'function')
			return this.model.onDataChange(dataName, dataVal);
		
		throw "The model does not implement any dataChange function";
	},
	
	/**
	 * Called to update the view (normally after a change of data)
	 */
	updateView: function(rel) {

		var val = CI.Repo.get(this.getNameFromRel(rel)), name;
		if(val) {
			name = val[0][0];
			val = val[1];

		}
		if(this.view.update2 && this.view.update2[rel])
			this.view.update2[rel].call(this.view, val, name);
	},

	updateAllView: function() {
		if(!this.view.update2 || !this.definition || !this.definition.dataSource)
			return;
		var val;
		for(var i = 0; i < this.definition.dataSource.length; i++) {
 			val = CI.Repo.get(this.definition.dataSource[i].name);
 			if(val && val[1])
				this.view.update2[this.definition.dataSource[i].rel].call(this.view, val[1], this.definition.dataSource[i].name);
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
		
		for(var i in this.definition.dataSource)
			if(this.definition.dataSource[i].name == name)
				return this.definition.dataSource[i].rel;
				
		return false;
	},

	getActionRelFromName: function(name) {
		for(var i in this.definition.actionsIn)
			if(this.definition.actionsIn[i].name == name)
				return this.definition.actionsIn[i].rel;
		return false;
	},

	inDom: function() {
		if(typeof this.view.inDom == "function")
			this.view.inDom();
		if(typeof this.controller.inDom == "function")
			this.controller.inDom();
		if(typeof this.model.inDom == "function")
			this.model.inDom();

		var self = this;
		this.getDomWrapper().get(0).addEventListener('contextmenu', function(e) {
			e.preventDefault();
			return self.handleContext(e);
		});

		this.setDisplayWrapper();
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
	
	getId: function() {
		return this.id;
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

	handleContext: function(e) {
		if(CI.Grid.contextMenu) {
			var self = this;
			CI.Grid.contextMenu
				.prepend(
					$('<li><a><span class="ui-icon ui-icon-arrow-4"></span> Move</a></li>').bind('click', function(e) {
						var pos = self.getDomWrapper().position();
						var shiftX = e.pageX - pos.left;
						var shiftY = e.pageY - pos.top;
						CI.Grid.moveModule(self, shiftX, shiftY);
					})
				)
				.prepend(
					$('<li><a><span class="ui-icon ui-icon-suitcase"></span> Export</a></li>').bind('click', function() {
						self.exportData();
					})
				)

				.prepend(
					$('<li><a><span class="ui-icon ui-icon-arrowreturn-1-n"></span> Move to front</a></li>').bind('click', function() {
						CI.Grid.moveToFront(self);
					})
				)

				.prepend(
					$('<li><a><span class="ui-icon ui-icon-arrowreturn-1-s"></span> Move to back</a></li>').bind('click', function() {
						CI.Grid.moveToBack(self);
					})
				)

				.prepend(
					$('<li><a><span class="ui-icon ui-icon-close"></span> Delete module</a></li>').bind('click', function() {
						Entry.removeModule(self);
					})
				)
				.prepend(
					$('<li><a><span class="ui-icon ui-icon-gear"></span> Parameters</a></li>').bind('click', function() {
						$(document).trigger('configModule', self);
					})
				);
		}
		return false;
	},

	setDisplayWrapper: function() {
		var bln = this.definition.displayWrapper;
		this.getDomWrapper()[(bln === true || bln == undefined) ? 'addClass' : 'removeClass']('ci-module-displaywrapper');
		
		try {
			this.getDomWrapper().resizable((bln === true || bln == undefined) ? 'enable' : 'disable');
		} catch(e) {}; 
	}
};

/*
 * Static functions
 */
CI.Module.prototype._impl = {
	
	model: {
		
		/**
		 * Set up the model (MVC) for a module. The model contains the data concerning the module.
		 * @param module the module to which this model is associated
		 * @param model the model being associated
		 */
		init: function(module) {
			var sourceName, sourceAccepts;
			module.model = this;
			this.data = [];
			this.module = module;
			//loop through the data provided in the definition and copy it into the model as a DataSource
			this.resetListeners();
			//	model.dataValue[sourceName] = null;
		},

		resetListeners: function() {
			this.sourceMap = null;
			if(this._varlisten && this._actionlisten) {
				CI.Repo.unListen(this.getVarNameList(), this._varlisten);
				CI.Actions.unListen(this.getActionNameList(), this._actionlisten);
			}
			this._varlisten = CI.Repo.listen(this.getVarNameList(), $.proxy(this.onVarGet, this));
			this._actionlisten = CI.Actions.listen(this.getActionNameList(), $.proxy(this.onActionTrigger, this));
		},

		getVarNameList: function() {
			var list = this.module.definition.dataSource, listFinal = [], keyedMap = {};
			if(!list)
				return [];
			for(var l = list.length, i = l - 1; i >= 0; i--) {
				listFinal.push(list[i].name)
				keyedMap[list[i].name] = list[i];
			}
			this.sourceMap = keyedMap;
			return listFinal;
		},

		getActionNameList: function() {
			var list = this.module.definition.actionsIn, 
				names = [];

			if(!list)
				return names;

			for(var l = list.length, i = l - 1; i >= 0; i--)
				names.push(list[i].name);

			return names;
		},

		onVarGet: function(varValue, varName) {

			if(!this.sourceMap)
				return;
			var value = this.buildData(varValue, this.sourceMap[varName]);
			this.data[varName] = varValue;
			var rel = this.module.getDataRelFromName(varName);
			
			if(rel && this.module.view.update2 && this.module.view.update2[rel])
				this.module.view.update2[rel].call(this.module.view, varValue, varName[0]);
 		},

		onActionTrigger: function(value, actionName) {

			var actionRel = this.module.getActionRelFromName(actionName[0]);
			if(this.module.view.onActionReceive && this.module.view.onActionReceive[actionRel]) {
				this.module.view.onActionReceive[actionRel].call(this.module.view, value, actionName);
			}
 		},

 		buildData: function(data, source) {

			var dataRebuilt = {};
			if(!source)
				return;
			if(!(source.type instanceof Array))
				source.type = [source.type];

			var dataType = CI.DataType.getType(data);
			
			var mustRebuild = false;
			for(var i = 0; i < source.type.length; i++) {
				if(source.type[i] == dataType) {
					return data;
				}
			}
			if(mustRebuild)
				return dataRebuilt;
			return false;
		}
	},
	
	controller: {
		/**
		 * Initialise the given module's controller (mvc)
		 */
		init: function(module) {
			this.module = module;	
			if(this.initimpl)
				this.initimpl();
		},

		sendAction: function(rel, value, event) {
			var actionsOut = this.module.definition.actionsOut;
			if(!actionsOut)
				return;
			var i = actionsOut.length - 1;
			for(; i >= 0; i--) {
				if(actionsOut[i].rel == rel && ((event && event == actionsOut[i].event) || !event)) {

					(function(actionname, value, jpath) {

						CI.DataType.getValueFromJPath(value, jpath || '').done(function(value) {
							CI.API.executeActionScript(actionname, value);
							
							CI.Actions.set(actionname, value);
						});

					})(actionsOut[i].name, value, actionsOut[i].jpath)
					
				}
			}
		}
	}
}