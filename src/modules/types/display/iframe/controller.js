'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        name: 'Iframe',
        description: 'Shows a integrated iframe with URL as an input',
        author: 'Norman Pellet',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: 'iframe'
    };

    Controller.prototype.references = {
        url: {
            type: 'string',
            label: 'URL',
            description: 'Iframe URL'
        }
    };

    Controller.prototype.variablesIn = ['url'];

    Controller.prototype.configurationStructure = function () {
        var jpaths = this.module.model.getjPath();

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {

                        colnumber: {
                            type: 'text',
                            default: 5,
                            title: 'Number of columns'
                        },

                        valjPath: {
                            type: 'combo',
                            title: 'Value jPath',
                            options: jpaths
                        },

                        colorjPath: {
                            type: 'combo',
                            title: 'Color jPath',
                            options: jpaths
                        },

                        width: {
                            type: 'text',
                            title: 'Cell width'
                        },

                        height: {
                            type: 'text',
                            title: 'Cell height'
                        }
                    }
                }
            }
        }
    };

    return Controller;

});
