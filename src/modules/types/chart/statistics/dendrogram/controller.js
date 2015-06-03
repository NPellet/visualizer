'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing'], function (Default, Traversing) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Circular dendrogram',
        description: 'Display a dendrogram based on jit',
        author: 'Luc Patiny',
        date: '30.12.2013',
        license: 'MIT',
        cssClass: 'dendrogram'
    };

    Controller.prototype.events = {
        onHover: {
            label: 'Hovers a node',
            refVariable: ['node']
        }
    };

    Controller.prototype.onHover = function (element) {
        if (!element) {
            return;
        }
        this.createDataFromEvent('onHover', 'node', element);
    };

    Controller.prototype.references = {
        tree: {
            type: ['tree'],
            label: 'A hierarchical tree'
        },
        node: {
            label: 'Node'
        }
    };

    Controller.prototype.variablesIn = ['tree'];

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        nodeType: {
                            type: 'combo',
                            title: 'Node Type',
                            'default': 'circle',
                            options: [
                                {title: 'Circle', key: 'circle'},
                                {title: 'Triangle', key: 'triangle'},
                                {title: 'Square', key: 'squqre'},
                                {title: 'Star', key: 'star'},
                                {title: 'Ellipse', key: 'ellipse'},
                                {title: 'Rectangle', key: 'rectangle'},
                                {title: 'Image', key: 'image'},
                                {title: 'Pie chart', key: 'piechart'}
                            ]
                        },
                        nodeSize: {
                            type: 'text',
                            title: 'Default node size'
                        },
                        nodeColor: {
                            type: 'color',
                            title: 'Default node color'
                        },
                        labelSize: {
                            type: 'text',
                            title: 'Default label size'
                        },
                        labelColor: {
                            type: 'color',
                            title: 'Default label color'
                        },
                        edgeWidth: {
                            type: 'text',
                            title: 'Default edge width'
                        },
                        edgeColor: {
                            type: 'color',
                            title: 'Default edge color'
                        },
                        strokeWidth: {
                            type: 'text',
                            title: 'Background line width'
                        },
                        strokeColor: {
                            type: 'color',
                            title: 'Background line color'
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        nodeType: ['groups', 'group', 0, 'nodeType', 0],
        nodeSize: ['groups', 'group', 0, 'nodeSize', 0],
        nodeColor: ['groups', 'group', 0, 'nodeColor', 0],
        labelSize: ['groups', 'group', 0, 'labelSize', 0],
        labelColor: ['groups', 'group', 0, 'labelColor', 0],
        edgeWidth: ['groups', 'group', 0, 'edgeWidth', 0],
        edgeColor: ['groups', 'group', 0, 'edgeColor', 0],
        strokeWidth: ['groups', 'group', 0, 'strokeWidth', 0],
        strokeColor: ['groups', 'group', 0, 'strokeColor', 0]
    };

    return Controller;

});
