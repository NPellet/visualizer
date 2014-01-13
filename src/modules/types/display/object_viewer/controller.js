define(['modules/default/defaultcontroller'], function(Default) {

    /**
     * Creates a new empty controller
     * @class Controller
     * @name Controller
     * @constructor
     */
    function controller() {
    }
    ;

    // Extends the default properties of the default controller
    controller.prototype = $.extend(true, {}, Default);

    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        moduleName: 'Object explorer',
        description: 'Display a JSON object',
        author: 'Michaël Zasso',
        date: '13.01.2014',
        license: 'MIT'
    };



    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        "value": {
            type: 'object',
            label: 'Any JSON object'
        },
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
    controller.prototype.variablesIn = ['value'];

    /*
     Received actions
     */
    controller.prototype.actionsIn = {
    };


    controller.prototype.configurationStructure = function(section) {

        return {};
            
    };

    controller.prototype.configFunctions = {
    };

    controller.prototype.configAliases = {
    }

    return controller;
});