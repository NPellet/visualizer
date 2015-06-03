'use strict';

define(['modules/default/defaultcontroller'], function (Default) {


    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Button',
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
        var text = this.module.getConfiguration('text');
        this.sendActionFromEvent('onClick', 'actionText', text);
        this.sendActionFromEvent(on ? 'onToggleOn' : 'onToggleOff', 'actionText', text);
    };

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        toggle: {
                            type: 'combo',
                            title: 'Button type',
                            'default': 'toggle',
                            options: [
                                {key: 'click', title: 'Click'},
                                {key: 'toggle', title: 'Toggle'}
                            ],
                            displaySource: {
                                click: 'c',
                                toggle: 't'
                            }
                        },
                        label: {
                            type: 'text',
                            title: 'Button label',
                            'default': 'Action',
                            displayTarget: ['c']

                        },
                        onLabel: {
                            type: 'text',
                            title: 'Button label (on)',
                            'default': 'Toggle action off',
                            displayTarget: ['t']
                        },
                        offLabel: {
                            type: 'text',
                            title: 'Button label (off)',
                            'default': 'Toggle action on',
                            displayTarget: ['t']
                        },
                        onColor: {
                            type: 'spectrum',
                            title: 'Color (on)',
                            'default': [0, 0, 0, 1],
                            displayTarget: ['t']
                        },
                        offColor: {
                            type: 'spectrum',
                            title: 'Color (off)',
                            'default': [0, 0, 0, 1],
                            displayTarget: ['t']
                        },
                        startState: {
                            type: 'combo',
                            title: 'Start State',
                            options: [
                                {key: 'on', title: 'On'},
                                {key: 'off', title: 'Off'}
                            ],
                            default: 'off',
                            displayTarget: ['t']
                        },
                        text: {
                            type: 'text',
                            title: 'Action text to send'
                        },
                        askConfirm: {
                            type: 'checkbox',
                            title: 'Ask for confirmation',
                            options: {yes: 'Yes'},
                            'default': [],
                            displaySource: {yes: 'y'}
                        },
                        confirmText: {
                            type: 'wysiwyg',
                            title: 'Confirmation text',
                            'default': 'Are you sure?',
                            displayTarget: ['y']
                        },
                        okLabel: {
                            type: 'text',
                            'default': 'Ok',
                            title: 'Ok label',
                            displayTarget: ['y']
                        },
                        cancelLabel: {
                            type: 'text',
                            title: 'Cancel label',
                            'default': 'Cancel',
                            displayTarget: ['y']
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        label: ['groups', 'group', 0, 'label', 0],
        onLabel: ['groups', 'group', 0, 'onLabel', 0],
        offLabel: ['groups', 'group', 0, 'offLabel', 0],
        onColor: ['groups', 'group', 0, 'onColor', 0],
        offColor: ['groups', 'group', 0, 'offColor', 0],
        text: ['groups', 'group', 0, 'text', 0],
        toggle: ['groups', 'group', 0, 'toggle', 0],
        askConfirm: ['groups', 'group', 0, 'askConfirm', 0],
        confirmText: ['groups', 'group', 0, 'confirmText', 0],
        okLabel: ['groups', 'group', 0, 'okLabel', 0],
        cancelLabel: ['groups', 'group', 0, 'cancelLabel', 0],
        startState: ['groups', 'group', 0, 'startState', 0]
    };

    return Controller;

});
