
define(['modules/default/defaultcontroller','components/x2js/xml2json.min'], function(Default,X2JS) {

    function controller() {
        this.running = false;
        this.runners = [];
        this.variables = new DataObject();
        this.converter = new X2JS();
    }

    // Extends the default properties of the default controller
    controller.prototype = $.extend(true, {}, Default);


    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        moduleName: 'Webservice Cron',
        description: 'Cron service allowing to fetch data from the server',
        author: 'Norman Pellet, Luc Patiny, Michaël Zasso',
        date: '11.01.2014',
        license: 'MIT',
        cssClass: 'webservice_cron'
    };

    controller.prototype.start = function() {
        if (this.running)
            this.stop();
        this.doVariables();
    };

    controller.prototype.stop = function() {
        if (!this.running)
            return;
        for (var i = 0, ii = this.runners.length; i < ii; i++) {
            window.clearInterval(this.runners[i]);
        }
        this.runners = [];
        this.variables = new DataObject();
        this.running = false;
    };


    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        // ouput	
        result: {
            label: 'Global result',
            type: 'object'
        }
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {
        // List of all possible events
        onUpdateResult: {
            label: 'Updated result',
            refVariable: ['result']
        }
    };



    controller.prototype.doVariables = function() {

        var cfg = this.module.getConfiguration("cronInfos"), variable, time, url, datatype;

        if (!cfg)
            return;

        for (var i = 0, l = cfg.length; i < l; i++) {

            variable = cfg[i].variable;
            time = cfg[i].repeat;
            url = cfg[i].url;
            datatype = cfg[i].datatype;

            this.doAjax(this, variable, url, datatype);
            this.runners[i] = window.setInterval(this.doAjax, time * 1000, this, variable, url, datatype);
        }

        this.running = true;
    };



    controller.prototype.doAjax = function(self, variable, url, datatype) {
        var ajax = {
            url: url,
            dataType: 'text'
        };

        ajax.success = function(data) {
            var dataobj = data;
            if(datatype==='json') {
                var json = JSON.parse(data);
                dataobj = new DataObject(json, true);
            } else if(datatype==='xml') {
                dataobj = new DataObject(self.converter.xml_str2json(data), true);
            }
            
            self.addVar(variable, dataobj);
            self.setVarFromEvent('onUpdateResult', self.variables, 'result');
            self.module.view.log(true, variable);
        };
        ajax.method = 'get';
        ajax.type = 'get';

        ajax.error = function() {
            self.module.view.log(false, variable);
        };

        $.ajax(ajax);
    };

    controller.prototype.addVar = function(variable, data) {
        this.variables[variable] = data;
    };



    controller.prototype.configurationStructure = function() {
        return {
            groups: {
                cronInfos: {
                    options: {
                        type: 'table',
                        multiple: true
                    },
                    fields: {
                        variable: {
                            type: 'text',
                            title: 'Variable',
                            default: ''
                        },
                        url: {
                            type: 'text',
                            title: 'URL',
                            default: ''
                        },
                        datatype: {
                            type: "combo",
                            title: "Data type",
                            options: [{title: "Text", key: "text"}, {title: "JSON", key: "json"}, {title: "XML", key: "xml"}],
                            default:"json"
                        },
                        repeat: {
                            type: 'text',
                            title: 'Repetition time (s)',
                            default: '60'
                        }
                    }
                }
            }
        };
    };

    controller.prototype.configAliases = {
        cronInfos: ['groups', 'cronInfos', 0]
    };

    return controller;
});