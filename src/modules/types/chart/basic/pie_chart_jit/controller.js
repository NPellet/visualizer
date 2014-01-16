define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/api'], function(Default, Traversing, API) {

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
        moduleName: 'Pie chart',
        description: 'Display a pie chart based on jit',
        author: '',
        date: '16.01.2014',
        license: 'MIT',
        cssClass: 'pie_chart_jit'
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {
        // List of all possible events

        /*onHover: {
         label: 'Hover a piece of pie',
         refVariable: [ 'piece' ]
         }*/
    };

    /*controller.prototype.onHover = function(element) {
     if( ! element ) {
     return;
     }
     this.setVarFromEvent( 'onHover', element, 'piece' );
     };*/



    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        chart: {
            type: ['chart'],
            label: 'A json describing a chart'
        },
        yArray: {
            type: 'array',
            label: '1D Y array'
        },
    };



    /*controller.prototype.elementHover = function(element) {
     if( ! element ) {
     return;
     }
     
     // this.setVarFromEvent( 'onHover', element, 'row' );
     if (this._highlighted) {
     API.highlight( this._highlighted, 0 );
     }
     API.highlight( element, 1 );
     this._highlighted=element;
     },
     
     controller.prototype.elementOut = function() {
     if (this._highlighted) {
     API.highlight( this._highlighted, 0 );
     }
     };*/


    /*
     Configuration of the module for receiving events, as a static object
     In the form of 
     */
    controller.prototype.variablesIn = ['chart', 'yArray'];


    controller.prototype.configurationStructure = function() {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        sliceOffset: {
                            type: 'text',
                            title: 'Slice offset',
                            default: 1
                        },
                        updateHeights: {
                            type: 'checkbox',
                            title: 'Slice height proportional to value ?',
                            options: {
                                updateHeights: 'Yes (Only for mono-serie pies)'
                            }
                        },
                        /*showLabels: {
                            type: 'checkbox',
                            title: 'Show labels ?',
                            options: {
                                showLabels: 'Yes'
                            }
                        },
                        labelColor: {
                            type: 'color',
                            title: 'Label color'
                        },*/
                    }
                }
            }
        };
    };

    controller.prototype.configFunctions = {
        'updateHeights': boolCheckbox,
        'showLabels': boolCheckbox
    };

    controller.prototype.configAliases = {
        'sliceOffset': ['groups', 'group', 0, 'sliceOffset', 0],
        'updateHeights': ['groups', 'group', 0, 'updateHeights', 0],
        'showLabels': ['groups', 'group', 0, 'showLabels', 0],
        'labelColor': ['groups', 'group', 0, 'labelColor', 0]
    };

    function boolCheckbox(cfg) {
        return (cfg.length !== 0);
    };


    return controller;
});

