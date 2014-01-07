define(['modules/defaultcontroller'], function(Default) {

    function controller() {
    }

    controller.prototype = $.extend(true, {}, Default);

    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        moduleName: 'Map',
        description: 'Display a map with markers',
        author: 'Michaeël Zasso',
        date: '07.01.2014',
        license: 'MIT'
    };



    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        "geo": {
            type: ['geojson'],
            label: 'A GeoJSON object'
        }
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {
    };


    /*
     Configuration of the module for receiving events, as a static object
     In the form of 
     */
    controller.prototype.variablesIn = ['geo'];

    /*
     Received actions
     */
    controller.prototype.actionsIn = {
    };


    controller.prototype.configurationStructure = function() {

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        mapcenter: {
                            type: 'text',
                            title: 'Map center'
                        },
                        mapzoom: {
                            type: 'combo',
                            title: 'Zoom',
                            options: [
                                {title: '0', key: '0'},
                                {title: '1', key: '1'},
                                {title: '2', key: '2'},
                                {title: '3', key: '3'},
                                {title: '4', key: '4'},
                                {title: '5', key: '5'},
                                {title: '6', key: '6'},
                                {title: '7', key: '7'},
                                {title: '8', key: '8'},
                                {title: '9', key: '9'},
                                {title: '10', key: '10'},
                                {title: '11', key: '11'},
                                {title: '12', key: '12'},
                                {title: '13', key: '13'},
                                {title: '14', key: '14'},
                                {title: '15', key: '15'},
                                {title: '16', key: '16'},
                                {title: '17', key: '17'},
                                {title: '18', key: '18'},
                                {title: '19', key: '19'}
                            ],
                        },
                    }
                }
            }
        };
    };

    controller.prototype.configFunctions = {
        'mapcenter': function(cfg) {
            var split = cfg.split(",");
            return [parseFloat(split[0]), parseFloat(split[1])];
        }
    };

    controller.prototype.configAliases = {
        'mapcenter': ['groups', 'group', 0, 'mapcenter', 0],
        'mapzoom' : ['groups', 'group', 0, 'mapzoom', 0]
    };

    return controller;
});