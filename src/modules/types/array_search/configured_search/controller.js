define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'lib/formcreator/formcreator'], function (Default, Traversing, FormCreator) {


    /**
     * Creates a new empty controller
     * @class Controller
     * @name Controller
     * @constructor
     */
    function Controller() {
    }

    // Extends the default properties of the default controller
    Controller.prototype = $.extend(true, {}, Default);

    /*
     Information about the module
     */
    Controller.prototype.moduleInformation = {
        moduleName: 'Configured search',
        description: 'Filters an array with configured UI criterias',
        author: 'Norman Pellet',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: 'configured_search'
    };

    /*
     Configuration of the input/output references of the module
     */
    Controller.prototype.references = {
        array: {
            label: 'An input array', // The input array is never modified
            type: 'array'
        },

        filteredArray: {
            label: 'Filtered array',
            type: 'array'
        },

        flagArray: {
            label: 'Array of booleans',
            type: 'array'
        },
        countResult: {
            type: 'number',
            label: 'Number of selected items'
        }
    };

    /*
     Configuration of the module for sending events, as a static object
     */
    Controller.prototype.events = {

        // List of all possible events
        'onSearchDone': {
            label: 'When a search is performed',
            refVariable: [ 'filteredArray', 'flagArray' ],
            refAction: [ 'filteredArray', 'flagArray', 'countResult' ]
        }
    };

    /*
     Configuration of the module for receiving events, as a static object
     In the form of
     */
    Controller.prototype.variablesIn = [ 'array' ];

    Controller.prototype.actionsIn = {
        disable: "Disable the search"
    };

    Controller.prototype.configurationStructure = function (section) {

        var all_jpaths = [],
            arr = this.module.getDataFromRel('array');

        if (arr) {
            arr = arr.get();
            Traversing.getJPathsFromElement(arr[ 0 ], all_jpaths);
        }

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        max: {
                            type: 'text',
                            title: 'Maximum hits',
                            'default': '50'
                        },
                        disableMessage: {
                            type: 'text',
                            title: 'Disable message',
                            'default': 'Click to enable search'
                        }
                    }
                }
            },
            sections: {
                searchFields: FormCreator.makeConfig({ name: 'Search on', jpaths: all_jpaths }, { name: "Comparison" })
            }
        };
    };

    Controller.prototype.searchDone = function (arr, flags) {

        // Sets the variable corresponding to the onSearchDone event

        this.createDataFromEvent('onSearchDone', 'flagArray', flags);
        this.sendAction('flagArray', flags, 'onSearchDone');

        this.createDataFromEvent('onSearchDone', 'filteredArray', arr);
        this.sendAction('filteredArray', arr, 'onSearchDone');
        this.createDataFromEvent('onSearchDone', 'countResult', arr.length);

    };

    Controller.prototype.configFunctions = {

        searchfields: function (cfg) {
            if (!( cfg instanceof Array )) {
                return [];
            }
            return cfg;
        }
    };

    Controller.prototype.configAliases = {
        searchfields: [ 'sections', 'searchFields' ],
        maxhits: ['groups', 'group', 0, 'max', 0],
        disableMessage: ['groups', 'group', 0, 'disableMessage', 0]
    };

    return Controller;
});