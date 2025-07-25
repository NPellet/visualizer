'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Button',
    description: 'Shows a button that will trigger a text action',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: 'button_action',
  };

  Controller.prototype.references = {
    actionText: {
      label: 'The action text to send',
      type: 'string',
    },
    actionValue: {
      label: 'Object with action information',
      type: 'object',
    },
  };

  Controller.prototype.events = {
    onToggleOn: {
      label: 'Button is toggled on',
      refAction: ['actionText', 'actionValue'],
    },
    onToggleOff: {
      label: 'Button is toggled off',
      refAction: ['actionText', 'actionValue'],
    },
    onClick: {
      label: 'Button is clicked',
      refAction: ['actionText', 'actionValue'],
    },
  };

  Controller.prototype.onClick = function (view) {
    var text = this.module.getConfiguration('text');
    let value = {
      label: text,
      state: view.currentState,
      isToggle: view.isToggle,
    };
    this.sendActionFromEvent('onClick', 'actionText', text);
    this.sendActionFromEvent('onClick', 'actionValue', value);
    this.sendActionFromEvent(
      view.currentState ? 'onToggleOn' : 'onToggleOff',
      'actionText',
      text,
    );
    this.sendActionFromEvent(
      view.currentState ? 'onToggleOn' : 'onToggleOff',
      'actionValue',
      value,
    );
  };

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list',
          },
          fields: {
            toggle: {
              type: 'combo',
              title: 'Button type',
              default: 'toggle',
              options: [
                { key: 'click', title: 'Click' },
                { key: 'toggle', title: 'Toggle' },
              ],
              displaySource: {
                click: 'c',
                toggle: 't',
              },
            },
            label: {
              type: 'text',
              title: 'Button label',
              default: 'Action',
              displayTarget: ['c'],
            },
            onLabel: {
              type: 'text',
              title: 'Button label (on)',
              default: 'Toggle action off',
              displayTarget: ['t'],
            },
            offLabel: {
              type: 'text',
              title: 'Button label (off)',
              default: 'Toggle action on',
              displayTarget: ['t'],
            },
            title: {
              type: 'text',
              title: 'Tooltip',
              default: '',
            },
            css: {
              type: 'jscode',
              mode: 'css',
              title: 'CSS',
              default: `font-size: 11px;
background-color: #E6E6E6;
border: 1px solid rgba(0, 0, 0, 0.2);
height: 30px;
padding: .5em 1em;
font-weight: bold;
cursor: pointer;`,
              displayTarget: ['c'],
            },
            cssOn: {
              type: 'jscode',
              mode: 'css',
              title: 'CSS (on)',
              default: `font-size: 11px;
background-color: #E6E6E6;
border: 1px solid rgba(0, 0, 0, 0.2);
height: 30px;
padding: .5em 1em;
font-weight: bold;
cursor: pointer;`,
              displayTarget: ['t'],
            },
            cssOff: {
              type: 'jscode',
              mode: 'css',
              title: 'CSS (off)',
              default: `font-size: 11px;
background-color: #E6E6E6;
border: 1px solid rgba(0, 0, 0, 0.2);
height: 30px;
padding: .5em 1em;
font-weight: bold;
cursor: pointer;`,
              displayTarget: ['t'],
            },
            startState: {
              type: 'combo',
              title: 'Start State',
              options: [
                { key: 'on', title: 'On' },
                { key: 'off', title: 'Off' },
              ],
              default: 'off',
              displayTarget: ['t'],
            },
            text: {
              type: 'text',
              title: 'Action text to send',
            },
            askConfirm: {
              type: 'checkbox',
              title: 'Ask for confirmation',
              options: { yes: 'Yes' },
              default: [],
              displaySource: { yes: 'y' },
            },
            confirmText: {
              type: 'wysiwyg',
              title: 'Confirmation text',
              default: 'Are you sure?',
              displayTarget: ['y'],
            },
            okLabel: {
              type: 'text',
              default: 'Ok',
              title: 'Ok label',
              displayTarget: ['y'],
            },
            cancelLabel: {
              type: 'text',
              title: 'Cancel label',
              default: 'Cancel',
              displayTarget: ['y'],
            },
            contentType: {
              type: 'combo',
              title: 'Content Type',
              options: [
                { key: 'imageUrl', title: 'Image url' },
                { key: 'svg', title: 'svg' },
                { key: 'content', title: 'Button' },
              ],
              displaySource: { svg: 'svg', imageUrl: 'imageUrl' },
              default: 'content',
            },
            content: {
              type: 'jscode',
              title: 'Content',
              mode: 'html',
              default: '',
              displayTarget: ['svg', 'imageUrl'],
            },
            maskOpacity: {
              type: 'float',
              title: 'Mask opacity',
              default: 0.6,
            },
          },
        },
      },
    };
  };

  Controller.prototype.configAliases = {
    label: ['groups', 'group', 0, 'label', 0],
    onLabel: ['groups', 'group', 0, 'onLabel', 0],
    offLabel: ['groups', 'group', 0, 'offLabel', 0],
    title: ['groups', 'group', 0, 'title', 0],
    css: ['groups', 'group', 0, 'css', 0],
    cssOn: ['groups', 'group', 0, 'cssOn', 0],
    cssOff: ['groups', 'group', 0, 'cssOff', 0],
    text: ['groups', 'group', 0, 'text', 0],
    toggle: ['groups', 'group', 0, 'toggle', 0],
    askConfirm: ['groups', 'group', 0, 'askConfirm', 0],
    confirmText: ['groups', 'group', 0, 'confirmText', 0],
    okLabel: ['groups', 'group', 0, 'okLabel', 0],
    cancelLabel: ['groups', 'group', 0, 'cancelLabel', 0],
    startState: ['groups', 'group', 0, 'startState', 0],
    content: ['groups', 'group', 0, 'content', 0],
    contentType: ['groups', 'group', 0, 'contentType', 0],
    maskOpacity: ['groups', 'group', 0, 'maskOpacity', 0],
  };

  Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
    activate: 'Activate button',
    deactivate: 'Deactivate button',
    toggle: 'Toggle button',
  });

  return Controller;
});
