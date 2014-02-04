define(['modules/types/client_interaction/code_editor/controller'], function(CodeEditor) {

    function controller() {
    }

    controller.prototype = Object.create(CodeEditor.prototype);

    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        moduleName: 'Filter editor',
        description: 'Write code for a filter and test it in real time',
        author: 'Michaël Zasso',
        date: '04.02.2014',
        license: 'MIT'
    };


    controller.prototype.references.dataobject = {
        label: "Object to filter"
    };
    
    controller.prototype.events = {
        onEditorChange: {
            label: 'The value in the editor has changed',
            refVariable: ['dataobject']
        }
    };
    
    controller.prototype.variablesIn = ['dataobject'];

    controller.prototype.configurationStructure = function(section) {

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        script: {
                            type: 'jscode',
                            title: 'Code',
                            mode: 'html',
                            default: "function filter(value) {\n    return value;\n}"
                        }
                    }
                }
            }
        };
    };
    
    controller.prototype.onEditorChanged = function(value, object) {
        var result = executeFilter(value.get(), object);
        if(typeof result !== "undefined")
            this.setVarFromEvent('onEditorChange', result, 'dataobject');
    };
    
    function executeFilter(filter, object) {
        var theFilter;
        try {
            eval("theFilter = "+filter);
            if(typeof theFilter === "function")
                return theFilter(object);
        } catch(e) {}
    }

    return controller;
});