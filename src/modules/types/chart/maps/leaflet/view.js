define(['modules/default/defaultview', 'src/util/util', 'src/util/api', 'components/leaflet/leaflet'], function(Default, Util, API, L) {

    function view() {
        this.mapID = Util.getNextUniqueId();
        this.mapLayers = {};
    }

    Util.loadCss('components/leaflet/leaflet.css');
    var blueIcon = L.icon({
        iconUrl: 'components/leaflet/images/marker-icon.png'
    });
    var redIcon = L.icon({
        iconUrl: 'modules/types/chart/maps/leaflet/marker-icon-red.png'
    });            

    view.prototype = $.extend(true, {}, Default, {
        init: function() {

            this.dom = $('<div id="' + this.mapID + '"></div>').css({
                height: '100%',
                width: '100%'
            });
            this.module.getDomContent( ).html(this.dom);
                
            
            this.onReady = $.Deferred();
        },
        inDom: function() {
        
            this.dom.empty();
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
            'position' : function(value) {
                if(value.length !== 2)
                    return;
                this.map.setView(L.latLng(value[0],value[1]));
            },
            'geojson': function(geo, varname) {
                var geoJson = geo.get();
                L.geoJson(geoJson,{}).addTo(map);
                /*var geoJson = geo.get();
                if(!this.module.data)
                    this.module.data = geoJson;
                if (this.mapLayers.hasOwnProperty(varname))
                    this.map.removeLayer(this.mapLayers[varname]);

                var newMarker = L.geoJson(geoJson);
                newMarker.data=geoJson;
                newMarker.addTo(this.map);
                addHighlight(this, geo, newMarker);
                this.mapLayers[varname] = newMarker;*/

            }/*,
            'geocollection': function(geo, varname) {
                if (this.mapLayers.hasOwnProperty(varname)) {
                    this.map.removeLayer(this.mapLayers[varname]);
                }
                if (!geo.length)
                    return;
                if(!this.module.data)
                    this.module.data = geo[0].get();
                var group = L.layerGroup();
                for (var i = 0; i < geo.length; i++) {
                    var obj = geo[i];
                    var geoJson = obj.get();
                    var layer = L.geoJson(geoJson);
                    layer.data = geoJson;
                    group.addLayer(layer);
                    addHighlight(this, obj, layer);
                }
                group.addTo(this.map);
                this.mapLayers[varname] = group;
            }*/
        },
        onResize: function() {
            this.map.invalidateSize();
        },
        onActionReceive: {
            position : function(val) {
                this.module.controller.moveActive=false;
                this.map.setView(L.latLng(val[0],val[1]));
                this.module.controller.moveActive=true;
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
            if(this._controller.moveActive)
                this._controller.sendAction('position', [center.lat,center.lng], 'onMapMove');
            
            var bounds = this.getBounds();

            this._controller.setBounds(bounds);
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
            view.module.controller.hoverElement(element,layer,theLayer);
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