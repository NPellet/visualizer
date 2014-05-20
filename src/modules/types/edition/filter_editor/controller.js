define(['modules/types/client_interaction/code_editor/controller'], function(CodeEditor) {

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
                            default: "function filter(value) {\n    // The returned value must be a DataObject.\n    // Use DataObject.check(toReturn, true) to create it for a new variable.\n    return value;\n}"
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
        'script': [ 'groups', 'group', 0, 'script', 0],
        'libs': [ 'groups', 'libs', 0]
    };
    
    controller.prototype.onButtonClick = function(value, object) {
        var that = this;
        var result = this.executeFilter(value.get(), object);
        result.done(function(data){
            if(typeof data !== "undefined")
                that.setVarFromEvent('onButtonClick', data, 'dataobject');
        });
    };
    
    controller.prototype.executeFilter = function(filter, object) {

        var neededLibs = this.module.getConfiguration("libs");
        var requireStart = "require"+getRequireStart(neededLibs);
        
        var def = $.Deferred();
        
        filter = filter || '""';
        var requireBody = "var theFilter; try{ theFilter = "+filter+"; } catch(e) {console.error('Filter parsing error : ', e);}";
        requireBody += "if(typeof theFilter === 'function') { var result; try { result = theFilter(object); } catch(e) { console.error('Filter execution error : ', e); } }";
        requireBody += "def.resolve(result);";
        
        var requireEnd = "});";
        
        eval(requireStart+requireBody+requireEnd);
        
        return def;
        
    };
    
    controller.prototype.export = function() {
        var neededLibs = this.module.getConfiguration("libs");
        var requireStart = "define"+getRequireStart(neededLibs)+"\n return ";
        var requireBody = this.module.getConfiguration("script");
        var requireEnd = ";\n});";
        
        return requireStart+requireBody+requireEnd;
    };
    
    function getRequireStart(neededLibs) {
        var required = "(['src/util/api'";
        var callback = "function(API";

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
        
        return required+"], "+callback+"){";
    }

    return controller;
});
