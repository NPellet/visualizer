'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    /**
     * Creates a new empty controller
     * @class Controller
     * @name Controller
     * @constructor
     */
    function controller() {
    }

    // Extends the default properties of the default controller
    controller.prototype = $.extend(true, {}, Default);

    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        name: 'Paste value',
        description: 'Paste any text and parse it in a variable',
        author: 'Michaël Zasso',
        date: '05.03.2014',
        license: 'MIT',
        cssClass: 'paste_text'
    };


    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {

        'value': {
            label: 'The parsed object'

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
    };

    controller.prototype.configurationStructure = function (section) {

        return {

            groups: {

                group: {
                    options: {
                        type: 'list'
                    },

                    fields: {

                        thevalue: {
                            type: 'jscode',
                            title: 'Value',
                            mode: 'text',
                            default: ''
                        },

                        type: {
                            type: 'combo',
                            title: 'Data type',
                            options: [
                                {title: 'Text', key: 'text'},
                                {title: 'JSON', key: 'json'},
                                {title: 'XML', key: 'xml'},
                                {title: 'CSV', key: 'csv'},
                            ],
                            default: 'text'
                        },

                    }
                }
            }
        };
    };

    controller.prototype.configFunctions = {};

    controller.prototype.configAliases = {
        'type': ['groups', 'group', 0, 'type', 0],
        'thevalue': ['groups', 'group', 0, 'thevalue', 0]
    };

    controller.prototype.valueChanged = function (value) {
        var type = this.module.getConfiguration('type'),
            def = $.Deferred(),
            that = this;
        switch (type) {
            case 'text':
                def.resolve(value);
                break;
            case 'json':
                def.resolve(JSON.parse(value));
                break;
            case 'csv':
                require(['components/papa-parse/papaparse.min'], function (Papa) {
                    def.resolve(Papa.parse(value).data);
                });
                break;
            case 'xml':
                require(['components/x2js/xml2json.min'], function (X2JS) {
                    def.resolve(new X2JS().xml_str2json(value));
                });
                break;
        }
        def.done(function (data) {

            if (that.module.definition.configuration.groups) that.module.definition.configuration.groups.group[0].thevalue[0] = value;
            that.createDataFromEvent('onEditorChange', 'value', DataObject.check(data, true));
        });


    };

    return controller;
});