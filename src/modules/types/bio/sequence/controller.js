'use strict';

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
        name: 'Sequence displayer',
        description: 'Displays DNA sequence with annotations',
        author: 'Daniel Kostro',
        date: '12.06.2014',
        license: 'MIT',
        cssClass: 'sequence_display'
    };
    


    /*
        Configuration of the input/output references of the module
    */
    controller.prototype.references = {
      sequence: {
        label: 'An Amino Acid Sequence'
      }
    };


    /*
        Configuration of the module for sending events, as a static object
    */
    controller.prototype.events = {
      onSequenceSelectionChanged: {
        label: 'A sequence was selected',
        refVariable: ['sequence']
      }
    };
    
    controller.prototype.onSequenceSelectionChanged = function(val) {
      this.createDataFromEvent('onSequenceSelectionChanged', 'sequence', DataObject.check(val, true));
    }
    

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
