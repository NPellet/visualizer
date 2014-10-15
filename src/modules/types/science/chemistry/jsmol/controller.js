'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        moduleName: 'JSMol module',
        description: 'Display a JSMol module',
        author: 'Nathanaêl Khodl, Luc Patiny',
        date: '30.12.2013',
        license: 'MIT',
        cssClass: 'jsmol'
    };

    Controller.prototype.references = {
        data: {
            type: ['cif', 'pdb', 'mol3d', 'magres', 'mol2d'],
            label: 'A molecule/protein data'
        }
    };

    Controller.prototype.variablesIn = ['data'];

    Controller.prototype.onJSMolScriptReceive = function (a) {
        this.module.view.executeScript(a);
    };

    Controller.prototype.configurationStructure = function (section) {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },

                    fields: {
                        script: {
                            type: 'jscode',
                            title: 'After load script'
                        }
                    }
                }
            }
        }
    };

    Controller.prototype.configAliases = {
        script: ['groups', 'group', 0, 'script', 0]
    };

    Controller.prototype.actionsIn = {
        jsmolscript: 'Some JSMol Script received'
    };

    return Controller;

});