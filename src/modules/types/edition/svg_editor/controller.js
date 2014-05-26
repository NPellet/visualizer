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
		moduleName: 'SVG Editor',
		description: 'SVG Editor',
		author: 'Daniel Kostro',
		date: '20.05.2014',
		license: 'MIT'
	};

	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
	  svgString: {
	    type: "svg",
      label: "A string describing an svg"
	  }
	};
  
  controller.prototype.events = {
    onChange: {
      label: "The svg content changed",
      refVariable: ["svgString"]
    }
  };
	
  controller.prototype.onChange = function(val) {
    this.setVarFromEvent("onChange", DataObject.check({type:"svg", value: val}, true), "svgString");
  }
	



	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [];

	
	
	controller.prototype.configurationStructure = function(section) {
		return {
			groups: {
				group: {
					options: {
						type: 'list'
					},

					fields: {
            svgcode: {
              type: 'jscode',
              mode: 'svg',
              title: 'SVG code'
            }
					}
				}
			}
		}		
	}

	controller.prototype.configAliases = {
		'svgcode': [ 'groups', 'group', 0, 'svgcode', 0 ]
	}

	
	return controller;
});