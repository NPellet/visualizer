'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        name: '1D NMR',
        description: 'Displays NMR jcamp files in the style of standard NMRs',
        author: 'Norman Pellet',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: '1dnmr'
    };

    Controller.prototype.references = {
        jcamp: {
            label: 'The jcamp file',
            type: 'jcamp'
        },

        plot: {
            label: 'The Plot object',
            type: 'object'
        }
    };

    Controller.prototype.variablesIn = ['jcamp'];

    Controller.prototype.configurationStructure = function () {

        var vars = [];
        var currentCfg = this.module.definition.vars_in;

        if (currentCfg) {
            var i = 0,
                l = currentCfg.length;
            for (; i < l; i++) {
                vars.push({
                    title: currentCfg[i].name,
                    key: currentCfg[i].name
                });
            }
        }

        return {
            groups: {
                lines: {
                    options: {
                        type: 'table',
                        multiple: true
                    },
                    fields: {
                        varname: {
                            type: 'combo',
                            title: 'Variable',
                            options: vars,
                            'default': ''
                        },
                        color: {
                            type: 'spectrum',
                            title: 'Color',
                            'default': [0, 0, 0, 1]
                        },
                        width: {
                            type: 'float',
                            title: 'Width (px)',
                            'default': 1
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        lines: ['groups', 'lines', 0]
    };

    return Controller;

});
