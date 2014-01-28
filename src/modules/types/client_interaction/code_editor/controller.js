define(['modules/default/defaultcontroller'], function(Default) {

    /**
     * Creates a new empty controller
     * @class Controller
     * @name Controller
     * @constructor
     */
    function controller() {
    }
    ;

    // Extends the default properties of the default controller
    controller.prototype = $.extend(true, {}, Default);

    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        moduleName: 'Code editor',
        description: 'Write code in any language and send the content to another module',
        author: 'Michaël Zasso',
        date: '23.01.2014',
        license: 'MIT'
    };



    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        "value": {
            label: 'String containing the code',
            type: 'string'
        }
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {
        onEditorChange: {
            label: 'The value in the editor has changed',
            refVariable: ['value']
        },
        onButtonClick: {
            label: 'The button was clicked',
            refAction: ['value']
        }
    };
    /*
     Configuration of the module for receiving events, as a static object
     In the form of 
     */
    controller.prototype.variablesIn = ['value'];

    /*
     Received actions
     */
    controller.prototype.actionsIn = {
    };


    controller.prototype.configurationStructure = function(section) {

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        mode: {
                            type: 'combo',
                            title: 'Mode',
                            options: [
                                {title: 'Text', key: 'text'},
                                {title: 'Javascript', key: 'javascript'},
                                {title: 'HTML', key: 'html'}
                            ],
                            default: 'text'
                        },
                        btnvalue: {
                            type: 'text',
                            title: 'Button text',
                            default: 'Send script'
                        },
                        iseditable: {
                            title: 'Display editor',
                            default: 'editable',
                            type: 'checkbox',
                            options: {'editable': 'Show the code editor'}
                        },
                        script: {
                            type: 'jscode',
                            title: 'Code',
                            mode: 'html'
                        }
                    }
                }
            }
        };
    };

    controller.prototype.configFunctions = {
    };

    controller.prototype.configAliases = {
        'mode': ['groups', 'group', 0, 'mode', 0],
        'btnvalue': [ 'groups', 'group', 0, 'btnvalue', 0],
        'iseditable': [ 'groups', 'group', 0 , 'iseditable', 0],
        'script': [ 'groups', 'group', 0, 'script', 0]
    };
    
    controller.prototype.onEditorChanged = function(value) {
        this.setVarFromEvent('onEditorChange', value, 'value');
    };
    
    controller.prototype.onButtonClick = function(value) {
        this.sendAction('value', value, 'onButtonClick');
    };

    return controller;
});