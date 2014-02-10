define(['modules/types/client_interaction/code_editor/controller','src/util/api'], function(CodeEditor, API) {

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
        onButtonClick: {
            label: 'The button was clicked',
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
    
    controller.prototype.onButtonClick = function(value, object) {
        var result = executeFilter(value.get(), object);
        if(typeof result !== "undefined")
            this.setVarFromEvent('onButtonClick', result, 'dataobject');
    };
    
    function executeFilter(filter, object) {
        var theFilter;
        eval("try{ theFilter = "+filter+"; } catch(e) {}");
        if(typeof theFilter === "function")
            return theFilter(object);
    }

    return controller;
});