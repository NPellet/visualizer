'use strict';

define(['modules/default/defaultcontroller', 'src/util/api', 'src/util/datatraversing', 'src/util/urldata'], function (Default, API, Traversing, URL) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'NMR spin system simulation',
        description: 'Allows to enter coupling constant',
        author: 'Luc Patiny',
        date: '30.12.2013',
        license: 'MIT',
        cssClass: 'webservice_nmr_spin'
    };

    Controller.prototype.initimpl = function () {
        this.result = null;
        this.request = null;
    };

    Controller.prototype.doAnalysis = function () {

        var self = this,
            url = this.module.getConfiguration('url'),
            reg,
            val,
            variable;

        // Replace all variables in the URL
        reg = /\<var:([a-zA-Z0-9]+)\>/;
        while (val = reg.exec(url)) {
            variable = API.getRepositoryData().get(val[1]) || [''];
            variable = variable[1];
            url = url.replace('<var:' + val[1] + '>', encodeURIComponent(variable));
        }

        this.url = url;

        var data = this.module.view.system.serializeArray();
        var toSend = {};
        for (var i = 0; i < data.length; i++) {
            toSend[data[i].name] = data[i].value;
        }

        this.module.view.lock();

        URL.post(url, toSend).then(function (data) {
            self.module.view.unlock();
            self.onAnalysisDone(data);
        });

    };


    Controller.prototype.onAnalysisDone = function (elements) {
        this.createDataFromEvent('onSearchReturn', 'results', elements);
        this.createDataFromEvent('onSearchReturn', 'url', this.url);

    };

    Controller.prototype.references = {
        results: {
            label: 'Results'
        },
        url: {
            label: 'URL'
        }
    };


    Controller.prototype.events = {
        onSearchReturn: {
            label: 'An analysis has been completed',
            refVariable: ['results']
        }
    };

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        url: {
                            type: 'text',
                            title: 'Service URL'
                        },
                        systemSize: {
                            type: 'combo',
                            title: 'Spin system',
                            'default': '2',
                            options: [
                                {key: '2', title: 'AB'},
                                {key: '3', title: 'ABC'},
                                {key: '4', title: 'ABCD'},
                                {key: '5', title: 'ABCDE'},
                                {key: '6', title: 'ABCDEF'}
                            ]
                        },
                        button: {
                            type: 'checkbox',
                            title: 'Process button',
                            'default': 'button',
                            options: {button: ''}
                        },
                        buttonlabel: {
                            type: 'text',
                            'default': 'Calculate',
                            title: 'Button text'
                        },
                        buttonlabel_exec: {
                            type: 'text',
                            'default': 'Calculating',
                            title: 'Button text (executing)'
                        },
                        onloadanalysis: {
                            type: 'checkbox',
                            title: 'Make one process on load',
                            'default': 'onload',
                            options: {onload: ''}
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        url: ['groups', 'group', 0, 'url', 0],
        button: ['groups', 'group', 0, 'button', 0],
        systemSize: ['groups', 'group', 0, 'systemSize'],
        buttonlabel: ['groups', 'group', 0, 'buttonlabel', 0],
        buttonlabel_exec: ['groups', 'group', 0, 'buttonlabel_exec', 0],
        onloadanalysis: ['groups', 'group', 0, 'onloadanalysis', 0, 0]
    };

    return Controller;

});
