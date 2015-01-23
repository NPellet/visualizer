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
		name: 'SVG Editor',
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
	  },
    
    svgModifier: {
      label: "An object describing svg modification"
    },
    
    info: {
      label: "An info object"
    }
	};
  
  controller.prototype.events = {
    onChange: {
      label: "The svg content changed",
      refVariable: ["svgString"]
    },
    
    onHover: {
      label: "An svg element is hovered",
      refVariable: ["info"]
    },
    
    onClick: {
      label: "An svg element is clicked",
      refVariable: ["info"]
    }
  };
	
  controller.prototype.onChange = function(val) {
    this.createDataFromEvent("onChange", "svgString", DataObject.check({type:"svg", value: val}, true));
  }

  controller.prototype.onHover = function(val) {
    this.createDataFromEvent("onHover", "info", val);
  }
  
  controller.prototype.onClick = function(val) {
    this.createDataFromEvent("onClick", "info", val);
  }

	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = ['svgModifier'];

	
	
	controller.prototype.configurationStructure = function(section) {
		return {
			groups: {
				group: {
					options: {
						type: 'list'
					},

					fields: {
            editable: {
              type: 'checkbox',
              title: 'Is Editable',
              options: {isEditable: 'Yes'},
              default: []
            },
            
            sanitize: {
                type: 'checkbox',
                title: 'Sanitize',
                options: {doSanitize: 'yes'},
                default: []
            },
            
            svgcode: {
              type: 'jscode',
              mode: 'svg',
              title: 'SVG code'
            }
					}
				}
			}
		}		
	};

	controller.prototype.configAliases = {
		'svgcode': [ 'groups', 'group', 0, 'svgcode', 0 ],
        'editable': [ 'groups', 'group', 0, 'editable', 0 ],
        'sanitize': [ 'groups', 'group', 0, 'sanitize', 0 ]
	};

	
	return controller;
});