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
        moduleName: 'Function plotter',
        description: 'Plots an input function in 3D using Three.js',
        author: 'Luc Patiny',
        date: '28.12.2013',
        license: 'MIT',
        cssClass: 'plot_function'
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
    controller.prototype.variablesIn = [ 'function' ];

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

                        'function': {
                            type: 'text',
                            default: 'sin(sqrt(0.01*x^2  + 0.01*y^2))*10',
                            title: 'Mathematical function'
                        },

                        xMin: {
                            type: 'text',
                            default: -100,
                            title: 'Min X'
                        },

                        xMax: {
                            type: 'text',
                            default: 100,
                            title: 'Max X'
                        },

                        yMin: {
                            type: 'text',
                            default: -100,
                            title: 'Min Y'
                        },

                        yMax: {
                            type: 'text',
                            default: 100,
                            title: 'Max Y'
                        },

                        zMin: {
                            type: 'text',
                            title: 'Min Z'
                        },

                        zMax: {
                            type: 'text',
                            title: 'Max Z'
                        },

                        segments: {
                            type: 'text',
                            default: 100,
                            title: 'Number segments'
                        }
                    }
                }
            }
        };
    };

        
    controller.prototype.configAliases = {
        'function': [ 'groups', 'group', 0, 'function', 0 ],
        'xMin': [ 'groups', 'group', 0, 'xMin', 0 ],
        'xMax': [ 'groups', 'group', 0, 'xMax', 0 ],
        'yMin': [ 'groups', 'group', 0, 'yMin', 0 ],
        'yMax': [ 'groups', 'group', 0, 'yMax', 0 ],
        'zMin': [ 'groups', 'group', 0, 'zMin', 0 ],
        'zMax': [ 'groups', 'group', 0, 'zMax', 0 ],
        'segments': [ 'groups', 'group', 0, 'segments', 0 ]
    };

    return controller;
});
