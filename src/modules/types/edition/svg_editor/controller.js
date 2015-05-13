'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'SVG Editor',
        description: 'SVG Editor',
        author: 'Daniel Kostro',
        date: '20.05.2014',
        license: 'MIT'
    };

    Controller.prototype.references = {
        svgString: {
            type: 'svg',
            label: 'A string describing an svg'
        },

        svgModifier: {
            label: 'An object describing svg modification'
        },

        info: {
            label: 'An info object'
        }
    };

    Controller.prototype.events = {
        onChange: {
            label: 'The svg content changed',
            refVariable: ['svgString']
        },

        onHover: {
            label: 'An svg element is hovered',
            refVariable: ['info']
        },

        onClick: {
            label: 'An svg element is clicked',
            refVariable: ['info']
        }
    };

    Controller.prototype.onChange = function (val) {
        this.createDataFromEvent('onChange', 'svgString', DataObject.check({
            type: 'svg',
            value: val
        }, true));
    };

    Controller.prototype.onHover = function (val) {
        this.createDataFromEvent('onHover', 'info', val);
    };

    Controller.prototype.onClick = function (val) {
        this.createDataFromEvent('onClick', 'info', val);
    };

    Controller.prototype.variablesIn = ['svgModifier'];

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        editable: {
                            type: 'checkbox',
                            title: 'Is Editable',
                            options: {isEditable: 'Yes'},
                            'default': []
                        },
                        sanitize: {
                            type: 'checkbox',
                            title: 'Sanitize',
                            options: {doSanitize: 'yes'},
                            'default': []
                        },
                        svgcode: {
                            type: 'jscode',
                            mode: 'svg',
                            title: 'SVG code'
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        svgcode: ['groups', 'group', 0, 'svgcode', 0],
        editable: ['groups', 'group', 0, 'editable', 0],
        sanitize: ['groups', 'group', 0, 'sanitize', 0]
    };

    return Controller;

});
