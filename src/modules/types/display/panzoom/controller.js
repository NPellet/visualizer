define( [ 'modules/default/defaultcontroller' ], function( Default ) {
    
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
        moduleName: 'Panzoom',
        description: 'Panzoom',
        author: 'Daniel Kostro',
        date: '15.06.2014',
        license: 'MIT',
        cssClass: 'mod_panzoom'
    };
    


  	/*
  		Configuration of the input/output references of the module
  	*/
  	controller.prototype.references = {
      picture: {
        type:'picture',
        label: 'A picture'
      }
  	};
  
    controller.prototype.events = {

    };
	
    

    /*
        Configuration of the module for receiving events, as a static object
        In the form of 
    */
    controller.prototype.variablesIn = ['picture'];

    /*
        Received actions
        In the form of

        {
            actionRef: 'actionLabel'
        }
    */
    controller.prototype.actionsIn = {
    
    };
    
        
    controller.prototype.configurationStructure = function(section) {
        
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },

                    fields: {

                    }
                }
            }
        };
    };

        
    controller.prototype.configAliases = {

    };

    return controller;
});
