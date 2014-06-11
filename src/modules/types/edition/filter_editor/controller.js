define(['modules/types/client_interaction/code_editor/controller','src/util/debug'], function(CodeEditor, Debug) {

    function controller() {
    }

    controller.prototype = Object.create(CodeEditor.prototype);

    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        moduleName: 'Script editor',
        description: 'Write code for a filter and test it in real time',
        author: 'Michaël Zasso',
        date: '04.02.2014',
        license: 'MIT'
    };


    controller.prototype.references.dataobject = {
        label: "Object to filter"
    };
	
	controller.prototype.references.filteredObject = {
		label: "Filtered object"
	};
    
    controller.prototype.events = {
        onButtonClick: {
            label: 'Button was clicked / Incoming variable',
            refVariable: ['filteredObject']
        }
    };
    
    controller.prototype.variablesIn = ['dataobject'];

    controller.prototype.configurationStructure = function() {

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
                            default: "//When the result is ready, use resolve(result) to send it.\n//In case of an error, use reject(error)\nresolve(value);"
                        }
                    }
                },
                libs: {
                    options: {
                        type: 'table',
                        multiple: 'true'
                    },
                    fields: {
                        lib: {
                            type : 'text',
                            title: 'url'
                        },
                        alias: {
                            type : 'text',
                            title: 'alias'
                        }
                    }
                }
            }
        };
    };
    
    controller.prototype.configAliases = {
        script: [ 'groups', 'group', 0, 'script', 0],
        libs: [ 'groups', 'libs', 0]
    };
    
    controller.prototype.onButtonClick = function(value, object) {
        var that = this;
        var result = this.executeFilter(value, object);
        result.then(function(data){
            if(typeof data !== "undefined")
                that.createDataFromEvent('onButtonClick', 'filteredObject', data);
        }, function(error){
			console.error("Filter execution error : ", error);
		});
    };
    
    controller.prototype.executeFilter = function(filter, object) {

        var neededLibs = this.module.getConfiguration("libs");
        var requireStart = "require"+getRequireStart(neededLibs);
        
        var requireBody = "(function(value, resolve, reject){\n"+filter+"\n})(object, resolve, reject);";
        
        var requireEnd = "});";
		
		
		var prom = new Promise(function(resolve,reject){
			eval('"use strict";\n'+requireStart+requireBody+requireEnd);
		});

        return prom;
    };
    
    controller.prototype.export = function() {
        var neededLibs = this.module.getConfiguration("libs");
        var requireStart = "define"+getRequireStart(neededLibs)+"\n\treturn {\n    filter: ";
        var requireBody = "function( value, resolve, reject ) {\n            "+this.module.getConfiguration("script").replace(/(\r\n|\r|\n)/g,"\n            ")+"\n        }\n    };";
        var requireEnd = "\n});";
        
        return requireStart+requireBody+requireEnd;
    };
    
    function getRequireStart(neededLibs) {
        var required = "( [ 'src/util/api'";
        var callback = "function( API";

        if (neededLibs) {
            for (var i = 0; i < neededLibs.length; i++) {
                var neededLib = neededLibs[i];
                if (neededLib.lib) {
                    required += ", '" + neededLib.lib + "'";
                    callback += ", " + (neededLib.alias || "required_anonymous_"+i);
                } else
                    continue;
            }
        }
        
        return required+" ], "+callback+" ){";
    }

    return controller;
});
