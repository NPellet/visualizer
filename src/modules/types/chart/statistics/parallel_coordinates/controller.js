define(['modules/default/defaultcontroller',"src/util/datatraversing"], function(Default, Traversing) {

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
        },
        "column": {
            label: 'Column description'
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
    
    controller.prototype.actionsIn = {
        addColumn: 'Add a column',
        removeColumn: 'Remove a column',
    };
    
    controller.prototype.configurationStructure = function(section) {

        var jpaths = Traversing.getJPathsFromElement(this.module.view._value[0]);
        return {
            groups: {               
                cols: {
                    options: {
                        type: 'table',
                        multiple: true,
                        title: 'Columns'
                    },
                    fields: {
                        name: {
                            type: 'text',
                            title: 'Columns name'
                        },
                        jpath: {
                            type: 'combo',
                            title: 'jPath',
                            options: jpaths
                        }
                    }
                }
            }
        };
    };
    
    controller.prototype.configAliases = {
        'colsjPaths': ['groups', 'cols', 0]
    };
    
    controller.prototype.onBrushSelection = function(value, convert) {
        var toSend = value;
        if(value[0] && value[0].hasOwnProperty('__id')) {
            var original = this.module.view._value;
            toSend = new Array(value.length);
            for(var i = 0; i < value.length; i++) {
                toSend[i] = original[value[i].__id];
            }
        }
        this.setVarFromEvent("onBrushSelection", new DataArray(toSend), "value");
    };


    return controller;
});