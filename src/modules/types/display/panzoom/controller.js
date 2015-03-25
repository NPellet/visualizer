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
        name: 'Panzoom',
        description: 'Panzoom',
        author: 'Daniel Kostro',
        date: '15.06.2014',
        license: 'MIT',
        cssClass: 'panzoom'
    };



    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        picture: {
            type: ['picture', 'png', 'jpeg', 'jpg','gif'],
            label: 'A picture'
        },
        pixel: {
            label: 'A pixel'
        },
        allpixel: {
            label: 'A hash map of pixels by varname'
        }
    };

    controller.prototype.events = {
        click: {
            label: 'The image was clicked',
            refVariable: ['pixel', 'allpixel'],
            refAction: ['pixel']
        }
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
        var vars = [];
        var currentCfg = this.module.definition.vars_in;

        if(currentCfg) {

            var i = 0,
                l = currentCfg.length;

            for( ; i < l ; i++) {
                vars.push({
                    title: currentCfg[i].name,
                    key: currentCfg[i].name
                });
            }
        }

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },

                    fields: {

                    }
                },

                img: {
                    options: {
                        type: 'table',
                        multiple: true
                    },

                    fields: {
                        variable: {
                            type: 'combo',
                            title: 'Variable In',
                            options: vars,
                            default: ''
                        },

                        opacity: {
                            type: 'text',
                            title: 'Opacity [0,1]',
                            default: '1'
                        },

                        order: {
                            type: 'text',
                            title: 'z-index',
                            default: ''
                        },
                        rendering: {
                            type: 'combo',
                            title: 'Rendering',
                            options: [
                                { key: 'default', title: 'Normal'},
                                { key: 'crisp-edges', title: 'Crisp edges'}
                            ],
                            default: ['default']
                        },
                        scaling: {
                            type: 'combo',
                            title: 'Scaling Method',
                            options: [
                                { key: 'max', title: 'Extend to 100% of available spcae'},
                                { key: 'no', title: 'Keep original image size'}
                            ],
                            default: ['max']
                        }
                    }
                }
            }
        };
    };


    controller.prototype.configAliases = {
        img: [ 'groups', 'img', 0 ]
    };

    controller.prototype.clickedPixel = function(clickedPixel) {
        this.createDataFromEvent('click','pixel', clickedPixel);
    };

    controller.prototype.allClickedPixels = function(allClickedPixels) {
        this.createDataFromEvent('click', 'allpixel', allClickedPixels);
    };

    return controller;
});
