'use strict';

define(['modules/default/defaultcontroller', 'lib/formcreator/formcreator'], function (Default, FormCreator) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Templated form',
        description: 'A complex module allowing one to display a templated form in the module',
        author: 'Norman Pellet',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: 'form'
    };

    Controller.prototype.configurationStructure = function () {

        return {
            sections: {
                structure: {
                    options: {
                        title: 'Form structure'
                    },
                    groups: {
                        group: {
                            options: {
                                type: 'list'
                            },
                            fields: {
                                json: {
                                    type: 'jscode',
                                    mode: 'json',
                                    title: 'Form structure'
                                }
                            }
                        }
                    }
                },
                template: {
                    options: {
                        title: 'Template'
                    },
                    groups: {
                        template: {
                            options: {
                                type: 'list',
                                multiple: false
                            },
                            fields: {
                                file: {
                                    type: 'text',
                                    title: 'Template file'
                                },
                                html: {
                                    type: 'jscode',
                                    mode: 'html',
                                    title: 'HTML template'
                                }
                            }
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        structure: ['sections', 'structure', 0, 'groups', 'group', 0, 'json', 0],
        tpl_file: ['sections', 'template', 0, 'groups', 'template', 0, 'file', 0],
        tpl_html: ['sections', 'template', 0, 'groups', 'template', 0, 'html', 0]
    };

    return Controller;

});
