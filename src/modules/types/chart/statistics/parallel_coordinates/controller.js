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
        date: '14.01.2014',
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
       /* onObjectChange: {
            label: 'The object has changed',
            refVariable: ['value'],
        }*/
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

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        editable: {
                            type: 'combo',
                            title: 'Editable ?',
                            options: [
                                {title: 'No', key: 'view'},
                                {title: 'Yes', key: 'tree'},
                                {title: 'Text', key: 'text'}
                            ],
                            default: 'view'
                        },
                    }
                }
            }
        };
    };

    controller.prototype.configFunctions = {
    };

    controller.prototype.configAliases = {
        'editable': ['groups', 'group', 0, 'editable', 0]
    };

    return controller;
});