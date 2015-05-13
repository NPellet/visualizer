'use strict';

define(['modules/default/defaultcontroller', 'src/util/util'], function (Default, Util) {

    /**
     * Creates a new empty controller
     * @class Controller
     * @name Controller
     * @constructor
     */
    function controller() {
    }

    // Extends the default properties of the default controller
    controller.prototype = $.extend(true, {}, Default);


    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        name: 'Sticky note',
        description: 'Displays a sticky note',
        author: 'Norman Pellet',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: 'postit',
        hidden: true
    };


    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {

        value: {
            label: 'Sticky note value',
            type: 'string'
        }
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {
        onChange: {
            label: 'Value is changed',
            refVariable: ['value']
        }
    };


    /*
     Configuration of the module for receiving events, as a static object
     In the form of
     */
    controller.prototype.variablesIn = [];

    /*
     Received actions
     In the form of

     {
     actionRef: 'actionLabel'
     }
     */
    controller.prototype.actionsIn = {};


    controller.prototype.configurationStructure = function (section) {
        var standardFonts = Util.getWebsafeFonts();
        standardFonts.push({title: 'Post-it', key: 'Post_IT'});
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        fontfamily: {
                            type: 'combo',
                            title: 'Font-family',
                            'default': 'Post_IT',
                            options: standardFonts
                        },

                        editable: {
                            type: 'checkbox',
                            title: 'Is Editable',
                            options: {isEditable: 'Yes'},
                            default: ['isEditable']
                        }
                    }
                }
            }
        };
    };


    controller.prototype.configAliases = {
        fontfamily: ['groups', 'group', 0, 'fontfamily', 0],
        editable: ['groups', 'group', 0, 'editable', 0]
    };

    return controller;
});

