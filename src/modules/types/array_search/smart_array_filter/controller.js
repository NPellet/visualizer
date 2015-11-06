'use strict';

define(['jquery', 'modules/default/defaultcontroller', 'smart-array-filter'], function ($, Default, filter) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Smart array filter',
        description: 'Use simple text queries to search in an array of complex objects.',
        author: 'Michaël Zasso',
        date: '06.11.2015',
        license: 'MIT',
        cssClass: 'smart_array_filter'
    };

    Controller.prototype.references = {
        input: {
            label: 'Input array',
            type: 'array'
        },
        output: {
            label: 'Output array',
            type: 'array'
        }
    };

    Controller.prototype.events = {
        onQuery: {
            label: 'Query is changed',
            refVariable: ['output']
        }
    };

    Controller.prototype.variablesIn = ['input'];

    //Controller.prototype.configurationStructure = function () {
    //    return {
    //        groups: {
    //            group: {
    //                options: {
    //                    type: 'list'
    //                },
    //                fields: {
    //                }
    //            }
    //        }
    //    };
    //};
    //
    //Controller.prototype.configAliases = {
    //};

    Controller.prototype.onQuery = function (query) {
        var array = this.module.view._data;
        if (!array) return;
        var result = filter(array, {keywords: query});
        this.createDataFromEvent('onQuery', 'output', result);
    };

    return Controller;

});
