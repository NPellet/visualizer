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
        moduleName: 'Parallel coordinates',
        description: 'Multivariate data visualization',
        author: 'Michaël Zasso',
        date: '11.03.2014',
        license: 'MIT'
    };



    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        "value": {
            type: 'array',
            label: 'An array of data points'
        }
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {
        onBrushSelection: {
            label: 'A selection has been made',
            refVariable: ['value'],
        }
    };

    controller.prototype.variablesIn = ['value'];
    
    controller.prototype.onBrushSelection = function(value) {
        this.setVarFromEvent("onBrushSelection", new DataArray(value), "value");
    }


    return controller;
});