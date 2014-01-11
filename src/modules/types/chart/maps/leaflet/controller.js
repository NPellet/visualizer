define(['modules/default/defaultcontroller','src/util/api','components/leaflet/leaflet'], function(Default,API,L) {

    function controller() {
        this.moveActive = true;
    }

    controller.prototype = $.extend(true, {}, Default);

    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        moduleName: 'Map',
        description: 'Display a map with objects in it',
        author: 'Michaeël Zasso',
        date: '11.01.2014',
        license: 'MIT'
    };



    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        "geo": {
            type: ['object'],
            label: 'A GeoJSON object'
        },
        "geoarray": {
            type: ['array'],
            label: 'Array of GeoJSON objects'
        },
        "position": {
            label : 'Geo coordinates',
            type: 'array'
        },
        "zoom" : {
            label : 'Zoom level',
            type : 'number'
        },
        "item" : {
            label : 'Marker'
        },
        "polygon" : {
            type : 'array',
            label : 'Map polygon'
        }
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {
        onMapMove : {
            label: 'The map has moved',
            refAction: [ 'position' ],
            refVariable : ['polygon']
        },
        onZoomChange : {
            label : 'The zoom level has changed',
            refAction: ['zoom']
        },
        onHoverMarker : {
            label : 'Hovers a marker',
            refVariable : ['item']
        },
    };


    /*
     Configuration of the module for receiving events, as a static object
     In the form of 
     */
    controller.prototype.variablesIn = ['geo','geoarray','polygon','position'];

    /*
     Received actions
     */
    controller.prototype.actionsIn = {
        position : "Move the map",
        zoom : "Change zoom"
    };


    controller.prototype.configurationStructure = function() {

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        maptiles: {
                            type: 'combo',
                            title: 'Base tile source',
                            options: [
                                {title: "OpenStreetMap", key: 'osm'},
                                {title: "HikeBike", key: 'hb'}
                            ],
                            default: 'osm'
                        },
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
                            default: '10'
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
        'mapzoom' : ['groups', 'group', 0, 'mapzoom', 0],
        'maptiles' : ['groups', 'group', 0, 'maptiles', 0]
    };
    
    controller.prototype.hoverElement = function(element, layer, subLayer) {
        if(subLayer instanceof L.Marker) {
            this.setVarFromEvent( 'onHoverMarker', layer.data, 'item' );
        }
        API.highlight( element, 1 );
    };
    
    controller.prototype.setBounds = function(bounds) {

        var arr = new Array(4);
        
        arr[0] = getGeoCoords(bounds.getSouthWest());
        arr[1] = getGeoCoords(bounds.getNorthWest());
        arr[2] = getGeoCoords(bounds.getNorthEast());
        arr[3] = getGeoCoords(bounds.getSouthEast());

        this.setVarFromEvent('onMapMove', new DataArray(arr), 'polygon');
    };
    
    function getGeoCoords(latLng) {
        return [latLng.lat,latLng.lng];
    }

    return controller;
});