'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Periodic table',
        description: 'Display the periodic table of elements',
        author: 'Daniel Kostro',
        date: '09.06.2015',
        license: 'MIT',
        cssClass: 'periodic-table'
    };

    Controller.prototype.references = {
        template: {
            label: 'template'
        },
        value: {
            label: 'Periodic tabel elements'
        },
        hltemplate: {
            label: 'Highlight template'
        },
        elements: {
            label: 'A selection of elements'
        }
    };

    Controller.prototype.events = {
        onPeriodSelect: {
            label: 'Period selected',
            refVariable: ['elements']
        },
        onGroupSelect: {
            label: 'Group selected',
            refVariable: ['elements']
        },
        onElementsSelect: {
            label: 'Elements selected',
            refVariable: ['elements']
        }
    };

    Controller.prototype.variablesIn = ['template', 'hltemplate', 'value'];

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        templateSource: {
                            type: 'combo',
                            title: 'Table template source',
                            options: [
                                {key: 'varin', title: 'Variable in'},
                                {key: 'pref', title: 'Preferences'}
                            ],
                            displaySource: {varin: 'v', pref: 'p'},
                            default: 'varin'
                        },
                        template: {
                            type: 'jscode',
                            title: 'Table template',
                            mode: 'html',
                            displayTarget: ['p'],
                            'default': ''
                        },
                        hltemplateSource: {
                            type: 'combo',
                            title: 'Highlight template source',
                            options: [
                                {key: 'varin', title: 'Variable in'},
                                {key: 'pref', title: 'Preferences'}
                            ],
                            displaySource: {varin: 'hv', pref: 'hp'},
                            default: 'varin'
                        },
                        hltemplate: {
                            type: 'jscode',
                            title: 'Highlight template',
                            mode: 'html',
                            displayTarget: ['hp'],
                            'default': ''
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        template: ['groups', 'group', 0, 'template', 0],
        templateSource: ['groups', 'group', 0, 'templateSource', 0],
        hltemplate: ['groups', 'group', 0, 'hltemplate', 0],
        hltemplateSource: ['groups', 'group', 0, 'hltemplateSource', 0]
    };

    Controller.prototype.periodSelected = function(period) {
        var elements = this.module.getDataFromRel('value');
        elements = elements.filter(el => {
            return el.period == period;
        });

        this.createDataFromEvent('onPeriodSelect', 'elements', elements);
    };

    Controller.prototype.groupSelected = function(group) {
        var elements = this.module.getDataFromRel('value');
        elements = elements.filter(el => {
            return el.group == group;
        });

        this.createDataFromEvent('onGroupSelect', 'elements', elements);
    };

    Controller.prototype.elementsSelected = function(atomicNumbers) {
        atomicNumbers = atomicNumbers.map(el => +el);
        var elements = this.module.getDataFromRel('value');
        elements = elements.filter(el => {
            return atomicNumbers.indexOf(+DataObject.resurrect(el.Z)) > -1;
        });
        this.createDataFromEvent('onElementsSelect', 'elements', elements);
    };

    return Controller;

});
