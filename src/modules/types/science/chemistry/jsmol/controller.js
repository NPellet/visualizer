define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/api'], function(Default, Traversing, API) {
	
	/**
	 * Creates a new empty controller
	 * @class Controller
	 * @name Controller
	 * @constructor
	 */
	function controller() { };

	// Extends the default properties of the default controller
	controller.prototype = $.extend( true, {}, Default );

	/*
		Information about the module
	*/
	controller.prototype.moduleInformation = {
		moduleName: 'JSMol module',
		description: 'Display a JSMol module',
		author: 'Nathanaêl Khodl, Luc Patiny',
		date: '30.12.2013',
		license: 'MIT',
		cssClass: 'jsmol'
	};

	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		data: {
			type: ['pdb', 'mol3d', 'magres'],
			label: 'A molecule/protein data'
		}
	};


	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'data' ];


	controller.prototype.onJSMolScriptReceive = function(a) {
		this.module.view.executeScript(a.value);
	}

	
	
	controller.prototype.configurationStructure = function(section) {
		return {
			groups: {
				group: {
					options: {
						type: 'list'
					},

					fields: {
						script: {
							type: 'jscode',
							title: 'After load script'
						}
					}
				}
			}
		}		
	}

	controller.prototype.configAliases = {
		'script': [ 'groups', 'group', 0, 'script', 0 ]
	}


	controller.prototype.actionsIn = {
		'jsmolscript': 'Some JSMol Script received'
	}

	
	return controller;
});