define(['modules/default/defaultcontroller', 'lib/json-schema/schema'], function(Default, Schema) {

    function controller() {
    }

    controller.prototype = $.extend(true, {}, Default);

    controller.prototype.moduleInformation = {
        moduleName: 'Onde',
        description: 'Create a form base on a schema and output an object',
        author: 'Michaël Zasso',
        date: '17.04.2014',
        license: 'MIT'
    };
    
    controller.prototype.init = function() {
        this.inputSchema = {};
    };

    controller.prototype.references = {
        inputValue: {
            label: 'Input object'
        },
        outputValue: {
            label: 'Output object'
        },
        schema: {
            label: 'JSON schema'
        }
    };

    controller.prototype.events = {
        onFormSubmit: {
            label: 'The form was submitted',
            refVariable: ['outputValue']
        }
    };

    controller.prototype.variablesIn = ['inputValue', 'schema'];

    controller.prototype.actionsIn = {};


    controller.prototype.configurationStructure = function() {

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        output: {
                            type: 'combo',
                            title: 'Output result',
                            options: [
                                //{title: 'Modified input object', key: 'modified'},
                                {title: 'New object', key: 'new'}
                            ],
                            default: 'new'
                        },
                        mode: {
                            type: 'combo',
                            title: 'Form generation',
                            options: [
                                {title: 'Input object', key: 'object'},
                                {title: 'Schema', key: 'schema'},
                                //{title: 'Both', key: 'both'}
                            ],
                            default: 'object',
                            displaySource: {
                                object: 'o',
                                schema: 's',
                                both: 'b'
                            }
                        },
                        schemaSource: {
                            type: 'combo',
                            title: 'Schema source',
                            options: [
                                {title: 'Input variable', key: 'variable'},
                                {title: 'Config', key: 'config'}
                            ],
                            displayTarget: ['s','b'],
                            displaySource: {
                                config: 'c'
                            },
                            default: 'config'
                        },
                        schema: {
                            type: 'jscode',
                            mode: 'json',
                            title: 'JSON schema',
                            default: '{}',
                            displayTarget: ['c']
                        }
                    }
                }
            }
        };
    };

    controller.prototype.configAliases = {
        output: ['groups', 'group', 0, 'output', 0],
        mode: ['groups', 'group', 0, 'mode', 0],
        schemaSource: ['groups', 'group', 0, 'schemaSource', 0],
        schema: ['groups', 'group', 0, 'schema', 0]
    };
    
    controller.prototype.getSchema = function() {
        var mode = this.module.getConfiguration('mode');
        var schema = {};
        if(mode === 'schema') {
            var schemaSource = this.module.getConfiguration("schemaSource");
            if(schemaSource==='variable')
                schema = this.inputSchema;
            else
                schema = JSON.parse(this.module.getConfiguration('schema'));
        } else if(mode === 'object') {
            schema = Schema.fromObject(this.module.view.inputObj);
        } else {
            //TODO mode mix
        }
        return schema;
    };
    
    controller.prototype.onSubmit = function(data) {
        var outputType = this.module.getConfiguration('output');
        if(outputType==='new')
            this.setVarFromEvent('onFormSubmit', DataObject.check(data, true));
        else
            this.updateInput(data);
    };
    
    controller.prototype.updateInput = function(newData) {
        //TODO update input object
    };

    return controller;
});