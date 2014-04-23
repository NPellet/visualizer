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
						button_text: {
							type: 'text',
							title: 'Text of the export button',
							default: 'Export'
						},
                        output: {
                            type: 'combo',
                            title: 'Output result',
                            options: [
                                {title: 'Modified input object', key: 'modified'},
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
                                {title: 'Both', key: 'both'}
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
        schema: ['groups', 'group', 0, 'schema', 0],
		button_text: ['groups', 'group', 0, 'button_text', 0]
    };
    
    controller.prototype.getSchema = function() {
        var mode = this.module.getConfiguration('mode');
        var schema = {};
		if(mode === "object" || mode === "both") {
			schema = Schema.fromObject(this.module.view.inputObj);
		}
        if(mode === 'schema' || mode === "both") {
            var schemaSource = this.module.getConfiguration("schemaSource");
			var intSchema;
            if(schemaSource==='variable')
                intSchema = this.inputSchema;
            else
                intSchema = JSON.parse(this.module.getConfiguration('schema'));
			$.extend(true, schema, intSchema);
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
		var input = this.module.view.inputObj;
		if(input) {
			input.mergeWith(newData, this.module.getId());
			this.setVarFromEvent('onFormSubmit', input);
		}
    };

    return controller;
});