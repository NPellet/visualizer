define(['modules/defaultview', 'util/util', 'util/api', 'libs/leaflet/leaflet-src'], function(Default, Util, API) {

    function view() {
        this.mapID = Util.getNextUniqueId();
        this.mapLayers = {};
    }

    Util.loadCss('scripts/libs/leaflet/leaflet.css');
    var blueIcon = L.icon({
        iconUrl: 'scripts/libs/leaflet/images/marker-icon.png'
    });
    var redIcon = L.icon({
        iconUrl: 'scripts/libs/leaflet/images/marker-icon-red.png'
    });            

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var html = '<div id="' + this.mapID + '"></div>';

            this.dom = $(html).css({
                height: '100%',
                width: '100%'
            });

            this.module.getDomContent( ).html(this.dom);
            this.onReady = $.Deferred();
        },
        inDom: function() {
            var center = this.module.getConfiguration('mapcenter') || [46.522117, 6.566144];
            var zoom = this.module.getConfiguration('mapzoom') || 10;
            
            this.map = L.map(this.mapID, {
                zoomAnimation: false
            }).setView(center, zoom);
            
            this.map._controller = this.module.controller;
            this.getTileLayer().addTo(this.map);

            this.map.on("move",this.moveAction);
            this.map.on("zoomend", this.zoomAction);
            
            this.onReady.resolve();
        },
        update: {
            'geo': function(geo, varname) {
                if (this.mapLayers.hasOwnProperty(varname))
                    this.map.removeLayer(this.mapLayers[varname]);
                try {
                    var newMarker = L.geoJson(geo.get());
                    newMarker.addTo(this.map);
                    addHighlight(this, geo, newMarker);
                    this.mapLayers[varname] = newMarker;
                } catch (e) {
                    console.error("error creating the marker");
                }
            },
            'geoarray': function(geo, varname) {
                if (this.mapLayers.hasOwnProperty(varname)) {
                    this.map.removeLayer(this.mapLayers[varname]);
                }
                if (!geo.length)
                    return;
                try {
                    var group = L.layerGroup();
                    for (var i = 0; i < geo.length; i++) {
                        var obj = geo[i];
                        var layer = L.geoJson(obj.get());
                        group.addLayer(layer);
                        addHighlight(this, obj, layer);
                    }
                    group.addTo(this.map);
                    this.mapLayers[varname] = group;
                } catch (e) {
                    console.error("error creating the group of markers");
                }
            }
        },
        onResize: function() {
            this.map.invalidateSize();
        },
        onActionReceive: {
            position : function(val) {
                this.map.off("move",this.moveAction);
                this.map.setView(new L.LatLng(val[0],val[1]));
                this.map.on("move",this.moveAction);
            },
            zoom : function(val) {
                var min = this.map.getMinZoom();
                var max = this.map.getMaxZoom();
                if(val < min) val = min;
                else if(val > max) val = max;
                this.map.setZoom(val);
            }
        },
        moveAction : function(){
            var center = this.getCenter();
            this._controller.sendAction('position', [center.lat,center.lng], 'onMapMove');
        },
        zoomAction : function() {
            this._controller.sendAction('zoom', this.getZoom(), 'onZoomChange');
        },
        getTileLayer : function() {
            var baselayer =  this.module.getConfiguration('maptiles') || 'osm';
            var tileLayer = {parameters:{}};
            switch(baselayer) {
                case 'hb':
                    tileLayer.template = 'http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png';
                    break;
                case 'osm':
                default:
                    tileLayer.template = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
                    tileLayer.parameters.attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
                    break;
            }
            return L.tileLayer(tileLayer.template,tileLayer.parameters);
        }
    });

    function addHighlight(view, element, layer) {
        var theLayer = layer._layers[layer._leaflet_id-1]; // Layers are encapsulated in a LayerGroup
        layer.on("mouseover", function() {
            API.highlight( element, 1 );
        });
        layer.on("mouseout", function() {
            API.highlight( element, 0 );
        });
        API.listenHighlight( element, function(onOff) {
            if(onOff) { // Highlight
                if(theLayer instanceof L.Marker) {
                    theLayer.setIcon(redIcon);
                } else {
                    layer.setStyle({color:'#ff3300'});
                }  
            } else { // disable Highlight
                if(theLayer instanceof L.Marker) {
                    theLayer.setIcon(blueIcon);
                } else {
                    layer.setStyle({color:'#0033ff'});
                } 
            }

        }, false, view.module.getId() );
    }

    return view;
});