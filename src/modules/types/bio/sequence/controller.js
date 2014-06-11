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
        moduleName: 'Sequence displayer',
        description: 'Displays DNA sequence with annotations',
        author: 'Luc Patiny',
        date: '28.12.2013',
        license: 'MIT',
        cssClass: 'sequence_display'
    };
    


    /*
        Configuration of the input/output references of the module
    */
    controller.prototype.references = {
        'function': {
            label: 'Mathematical function with x and y parameters',
            type: 'string'
        }
    };


    /*
        Configuration of the module for sending events, as a static object
    */
    controller.prototype.events = {
      
    
    };
    

    /*
        Configuration of the module for receiving events, as a static object
        In the form of 
    */
    controller.prototype.variablesIn = [ 'sequence' ];

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
