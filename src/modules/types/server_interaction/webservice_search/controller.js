define([ 'modules/default/defaultcontroller', 'src/util/api', 'components/superagent/superagent', 'uri/URITemplate', 'src/util/debug'], function (Default, API, superagent, URITemplate, Debug) {
    "use strict";

    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        moduleName: 'Webservice search',
        description: 'Performs a query to a server and returns the response',
        author: 'Norman Pellet, Michaël Zasso',
        date: '29.07.2014',
        license: 'MIT',
        cssClass: 'webservice_search'
    };

    Controller.prototype.references = {
        vartrigger: {
            label: 'A variable to trigger the query'
        },
        varinput: {
            label: 'A variable to add to the query'
        },
        results: {
            label: 'Search results'
        },
        url: {
            label: 'Lookup URL',
            type: 'string'
        }
    };

    Controller.prototype.events = {
        onSearchReturn: {
            label: 'On search complete',
            refVariable: [ 'results', 'url' ],
            refAction: [ 'results' ]
        }
    };

    Controller.prototype.variablesIn = [ 'vartrigger', 'url' ];

    Controller.prototype.actionsIn = {
        doSearch: 'Trigger search'
    };


    Controller.prototype.configurationStructure = function () {

        return {
            groups: {
                group: {
                    options: {
                        type: "list"
                    },
                    fields: {
                        url: {
                            type: "text",
                            title: "URL"
                        },
                        method: {
                            type: "combo",
                            title: "Query method",
                            options: [
                                { key: "GET", title: "GET"},
                                { key: "POST", title: "POST"},
                                { key: "PUT", title: "PUT"},
                                { key: "DELETE", title: "DELETE"},
                                { key: "HEAD", title: "HEAD"}
                            ],
                            "default": "POST"
                        },
                        dataType: {
                            type: "combo",
                            title: "Data type to send",
                            options: [
                                {key: "json", title: "JSON"},
                                {key: "form", title: "Form data"}
                            ],
                            "default": "form"
                        },
                        button: {
                            type: "checkbox",
                            title: "Search button",
                            options: { button: "" }
                        },
                        buttonlabel: {
                            type: "text",
                            title: "Button text"
                        },
                        buttonlabel_exec: {
                            type: "text",
                            title: "Button text (executing)"
                        },
                        onloadsearch: {
                            type: "checkbox",
                            title: "Make one query on load",
                            options: { button: "" }
                        },
                        resultfilter: {
                            type: "jscode",
                            title: "Result data filter"
                        }
                    }
                },
                headers: {
                    options: {
                        type: "table",
                        multiple: true,
                        title: "Request headers"
                    },
                    fields: {
                        name: {
                            type: "text",
                            title: "Name"
                        },
                        value: {
                            type: "text",
                            title: "Value"
                        }
                    }
                },
                searchparams: {
                    options: {
                        type: "table",
                        multiple: true,
                        title: "Form parameters"
                    },
                    fields: {
                        name: {
                            type: "text",
                            title: "Parameter name"
                        },
                        destination: {
                            type: "combo",
                            title: "Destination",
                            options: [
                                { key: "url", title: "URL"},
                                { key: "query", title: "Query string"},
                                { key: "data", title: "Post data"}
                            ],
                            "default": "query"
                        },
                        label: {
                            type: "text",
                            title: "Field label"
                        },
                        defaultvalue: {
                            type: "text",
                            title: "Default value"
                        },
                        fieldtype: {
                            type: "combo",
                            title: "Field type",
                            options: [
                                { key: "text", title: "Text"},
                                { key: "textarea", title: "Textarea"},
                                { key: "combo", title: "Combo"},
                                { key: "checkbox", title: "Checkbox"}
                            ],
                            "default": "text"
                        },
                        fieldoptions: {
                            type: "text",
                            title: "Field options (a:b;)"
                        }
                    }
                }
            },
            sections: {
                postvariables: {
                    options: {
                        multiple: false,
                        title: "Variable parameters"
                    },
                    groups: {
                        postvariables: {
                            options: {
                                type: "table",
                                multiple: true
                            },
                            fields: {
                                name: {
                                    type: "text",
                                    title: "Parameter name"
                                },
                                destination: {
                                    type: "combo",
                                    title: "Destination",
                                    options: [
                                        { key: "url", title: "URL"},
                                        { key: "query", title: "Query string"},
                                        { key: "data", title: "Post data"}
                                    ],
                                    "default": "data"
                                },
                                variable: {
                                    type: "text",
                                    title: "Variable name"
                                },
                                filter: {
                                    type: "combo",
                                    title: "Filter",
                                    options: [
                                        {key: "none", title: "None"},
                                        {key: "value", title: "Only value"}
                                    ],
                                    "default": "none"
                                }
                            }
                        }
                    }
                }
            }
        };

    };

    Controller.prototype.configFunctions = {
        button: function (cfg) {
            return cfg.indexOf('button') > -1;
        }
    };

    Controller.prototype.configAliases = {
        button: [ 'groups', 'group', 0, 'button', 0 ],
        url: [ 'groups', 'group', 0, 'url', 0 ],
        method: [ 'groups', 'group', 0, 'method', 0 ],
        searchparams: [ 'groups', 'searchparams', 0 ],
        buttonlabel: [ 'groups', 'group', 0, 'buttonlabel', 0 ],
        buttonlabel_exec: [ 'groups', 'group', 0, 'buttonlabel_exec', 0 ],
        onloadsearch: [ 'groups', 'group', 0, 'onloadsearch', 0, 0 ],
        resultfilter: [ 'groups', 'group', 0, 'resultfilter', 0 ],
        postvariables: [ 'sections', 'postvariables', 0, 'groups', 'postvariables', 0 ],
        headers: [ 'groups', 'headers', 0 ],
        dataType: [ 'groups', 'group', 0, 'dataType', 0 ]
    };

    Controller.prototype.initImpl = function () {

        this.queryValues = {};
        this.urlValues = {};
        this.dataValues = {};
        this.method = this.module.getConfiguration('method') || "POST";

        var searchparams = this.module.getConfiguration('searchparams') || [];
        for(var i = 0; i < searchparams.length; i++) {
            if(searchparams[i].name && searchparams[i].defaultvalue) {
                this.addValue(searchparams[i], searchparams[i].defaultvalue);
            }
        }

        this.headers = {};
        var headerList = this.module.getConfiguration('headers') || [];
        for (i = 0; i < headerList.length; i++) {
            var header = headerList[i];
            if (header.name && header.value) {
                this.headers[header.name] = header.value;
            }
        }

        this.dataType = this.module.getConfiguration('dataType');

        if (this.module.getConfiguration('resultfilter')) {
            eval("this.module.resultfilter = function(data) { try { \n " + this.module.getConfiguration('resultfilter') + "\n } catch(_) { console.log(_); } }");
        } else {
            delete this.module.resultfilter;
        }

        if (this.module.getConfiguration('onloadsearch')) {
            this.doSearch();
        }

        this.resolveReady();

    };

    Controller.prototype.addValue = function (option, value) {
        if("function" === typeof value.resurrect) {
            value = value.resurrect();
        }
        switch (option.destination) {
            case "query":
                this.queryValues[option.name] = value;
                break;
            case "url":
                this.urlValues[option.name] = value;
                break;
            case "data":
                this.dataValues[option.name] = value;
                break;
        }
    };

    Controller.prototype.doSearch = function () {

        var self = this,
            urltemplate = new URITemplate(this.module.view._url || this.module.getConfiguration('url'));

        /*
         The following is kept for retrocompatibility. Now, the url parameters can also be specified
         using the module configuration tab
         */
        var varsin = this.module.vars_in();
        for (var i = 0, ii = varsin.length; i < ii; i++) {
            var varin = varsin[i];
            if ((varin.rel === "vartrigger" || varin.rel === "varinput") && varin.name) {
                var theVar = API.getVar(varin.name).getData();
                if (theVar) {
                    this.urlValues[varin.name] = theVar.resurrect();
                }
            }
        }

        var toPost = this.module.getConfiguration('postvariables', []);
        for (i = 0, ii = toPost.length; i < ii; i++) {
            var valueToPost = API.getVar(toPost[i].variable).getData();
            if (valueToPost) {
                var value;
                var type = valueToPost.getType();
                if (type === "string" || type === "number" || type === "boolean") {
                    value = type;
                } else if (toPost[i].filter === "value") {
                    value = valueToPost.get();
                } else {
                    value = JSON.stringify(valueToPost);
                }
                this.addValue(toPost[i], value);
            }
        }

        this.url = urltemplate.expand(this.queryValues);

        if (this.request && this.request.abort) {
            // Cancel previous request
            this.request.abort();
        }

        this.request = superagent(this.method, this.url);

        this.request.set(this.headers)
            .query(this.queryValues)
            .send(this.dataValues)
            .type(this.dataType);

        this.module.view.lock();

        this.request.end(function (err, response) {
            if(err) {
                Debug.warn('Webservice search: request failed', err);
            } else {
                var body = response.body;
                if (self.module.resultfilter) {
                    body = self.module.resultfilter(body);
                }
                self.onSearchDone(body);
            }
            self.module.view.unlock();
        });

    };

    Controller.prototype.onSearchDone = function (elements) {
        this.result = elements;
        this.module.model.data = elements;

        this.createDataFromEvent('onSearchReturn', 'results', elements);
        this.createDataFromEvent('onSearchReturn', 'url', this.url);

        this.sendAction('results', elements, 'onSearchReturn');
    };

    return Controller;
});
