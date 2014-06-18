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
        moduleName: 'Object editor',
        description: 'Display and/or modify a JSON object',
        author: 'Michaël Zasso',
        date: '13.01.2014',
        license: 'MIT'
    };



    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        "value": {
            label: 'A JSON object'
        },
        "output": {
            label: 'Output object'
        }
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {
        onObjectChange: {
            label: 'The object has changed',
            refVariable: ['output'],
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
                        editable: {
                            type: 'combo',
                            title: 'Editable ?',
                            options: [
                                {title: 'No', key: 'view'},
                                {title: 'Yes', key: 'tree'},
                                {title: 'Text', key: 'text'}
                            ],
                            default: 'view'
                        },
                        expanded: {
                            type: 'checkbox',
                            title: 'Auto-expand JSON',
                            options: {expand: 'Yes'}
                        },
                        storeObject: {
                            type: 'checkbox',
                            title: 'Store object in view',
                            options: {expand: 'Yes'}
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
                        storedObject: {
                            type: 'jscode',
                            title: 'Object stored in view',
                            default: '{}'
                        }
                    }
                }
            }
        };
    };

    controller.prototype.configAliases = {
        editable: ['groups', 'group', 0, 'editable', 0],
        expanded: ['groups', 'group', 0, 'expanded', 0],
        storeObject: ['groups', 'group', 0, 'storeObject', 0],
        storedObject: ['groups', 'group', 0, 'storedObject', 0],
		output: ['groups', 'group', 0, 'output', 0]
		
    };

	controller.prototype.sendValue = function(newValue) {
        if(this.module.view.storeObject) {
            this.module.definition.configuration.groups.group[0].storedObject[0] = JSON.stringify(newValue);
        }
		var outputType = this.module.getConfiguration('output');

        if( outputType === 'new' ) {

            this.createDataFromEvent( 'onObjectChange', 'output', newValue );

        } else {

			var input = this.module.view.inputData;

			if( input ) {

				input.mergeWith(newValue, this.module.getId());
				this.setVarFromEvent( 'onObjectChange', 'output', 'value', [ ] );

			}
		}
	};
	
    return controller;
});