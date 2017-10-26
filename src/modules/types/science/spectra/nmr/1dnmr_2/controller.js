'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: '1D NMR',
        description: 'Displays NMR jcamp files in the style of standard NMRs',
        author: 'Norman Pellet',
        date: '20.09.2017',
        license: 'MIT',
        cssClass: '1dnmr_2'
    };

    Controller.prototype.references = {
        jcamp: {
            label: 'Slave jcamp',
            type: ['jcamp', 'string' ]
        },
        jcampMaster: {
          label: 'Master jcamp',
          type: ['jcamp', 'string' ]  
        },
        molecule: {
            label: 'Molecule in the SVG format',
            type: ['string']
        },
        plot: {
            label: 'The Plot object',
            type: 'object'
        }
    };

    Controller.prototype.variablesIn = ['jcamp', 'jcampMaster', 'molecule'];

    Controller.prototype.configurationStructure = function () {

        var currentCfg = this.module.definition.vars_in;
        let vars = [];

        if (currentCfg) {
            let i = 0,
                l = currentCfg.length;

            for ( ; i < l; i++) {
                
                if( currentCfg[i].rel == 'jcamp' ) {

                    vars.push( {
                        title: currentCfg[i].name,
                        key: currentCfg[i].name
                    } );
                }
            }
        }

       return {
            sections: {
                variables: {
                    options: {
                        title: 'Variables',
                        multiple: false
                    },
                    groups: {
                        variables: {
                            options: {
                                type: 'table',
                                multiple: true
                            },
                            fields: {
                                variable: {
                                    type: 'combo',
                                    title: 'Variable',
                                    options: vars,
                                    default: ''
                                },
                                plotcolor: {
                                    type: 'color',
                                    title: 'Color',
                                    default: [1, 1, 255, 1]
                                },
                                strokewidth: {
                                    type: 'text',
                                    title: 'Width (px)',
                                    default: '1'
                                }
                            }
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
