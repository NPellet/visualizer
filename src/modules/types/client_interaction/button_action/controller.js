'use strict';

define(['modules/default/defaultcontroller'], function (Default) {


    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        moduleName: 'Button action',
        description: 'Shows a button that will trigger a text action',
        author: 'Norman Pellet',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: 'button_action'
    };

    Controller.prototype.references = {
        actionText: {
            label: 'The action text to send',
            type: 'string'
        }
    };

    Controller.prototype.events = {
        onToggleOn: {
            label: 'Button is toggled on',
            refAction: ['actionText']
        },
        onToggleOff: {
            label: 'Button is toggled off',
            refAction: ['actionText']
        },
        onClick: {
            label: 'Button is clicked',
            refAction: ['actionText']
        }
    };

    Controller.prototype.onClick = function (on) {
        console.log('clicked.......');
        var text = this.module.getConfiguration('text');
        this.sendAction('actionText', text, 'onClick');
        this.sendAction('actionText', text, (on ? 'onToggleOn' : 'onToggleOff'));
    };

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        label: {
                            type: 'text',
                            title: 'Button label',
                            'default': 'Action'
                        },
                        text: {
                            type: 'text',
                            title: 'Action text to send'
                        },
                        toggle: {
                            type: 'combo',
                            title: 'Button type',
                            'default': 'toggle',
                            options: [{key: 'click', title: 'Click'}, {key: 'toggle', title: 'Toggle'}]
                        },
                        askConfirm: {
                            type: 'checkbox',
                            title: 'Ask for confirmation',
                            options: {yes: 'Yes'},
                            default: [],
                            displaySource: {yes: 'y'}
                        },
                        confirmText: {
                            type: 'jscode',
                            mode: 'html',
                            title: 'Confirmation text',
                            default: 'Are you sure?',
                            displayTarget: ['y']
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        label: ['groups', 'group', 0, 'label', 0],
        text: ['groups', 'group', 0, 'text', 0],
        toggle: ['groups', 'group', 0, 'toggle', 0],
        askConfirm: ['groups', 'group', 0, 'askConfirm', 0],
        confirmText: ['groups', 'group', 0, 'confirmText', 0]
    };

    return Controller;

});