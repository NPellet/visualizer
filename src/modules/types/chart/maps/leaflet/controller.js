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
        "geojson": {
            type: ['geojson-feature-collection','geojson-feature','geojson-geometry'],
            label: 'A GeoJSON object'
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
            label : "Object on the map",
            type : "object"
        }
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {
        onMapMove : {
            label: 'The map has moved',
            refAction: [ 'position' ]
        },
        onZoomChange : {
            label : 'The zoom level has changed',
            refAction: ['zoom']
        },
        onHoverMarker : {
            label : 'Hovers an object',
            refVariable : ['item']
        },
    };


    /*
     Configuration of the module for receiving events, as a static object
     In the form of 
     */
    controller.prototype.variablesIn = ['geojson','position'];

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
                            title: 'Map default center'
                        },
                        mapzoom: {
                            type: 'slider',
                            title: 'Zoom',
                            min: 0,
                            max: 19,
                            step: 1,
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