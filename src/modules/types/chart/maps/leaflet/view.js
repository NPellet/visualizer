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
                
            API.killHighlight(this.module.getId());
            
            this.onReady = $.Deferred();
        },
        inDom: function() {
        
            this.dom.empty();
            var center = this.module.getConfiguration('mapcenter') || [46.522117, 6.566144];
            var zoom = this.module.getConfiguration('mapzoom') || 10;
            
            this.map = L.map(this.mapID, {
                zoomAnimation: false
            }).setView(center, zoom);
            
            this.getTileLayer().addTo(this.map);

            this.map.on("drag",this.module.controller.moveAction, this);
            this.map.on("zoomend", this.module.controller.zoomAction, this);
            
            this.onReady.resolve();
        },
        blank: {
            geojson: function(varname) {
                if (this.mapLayers.hasOwnProperty(varname)) {
                    this.mapLayers[varname].clearLayers();
                    delete this.mapLayers[varname];
                }
            }
        },
        update: {
            position : function(value) {
                if(value.length !== 2)
                    return;
                this.map.setView(L.latLng(value[0],value[1]));
            },
            geojson: function(geo, varname) {
                if(!geo)
                    return;
                var geoJson = geo.get();
                var converted = L.geoJson(geoJson,{});
                
                converted.addTo(this.map);
                this.mapLayers[varname] = converted;
                
                converted.eachLayer(addEvents, this);

            }
        },
        onResize: function() {
            this.map.invalidateSize();
        },
        onActionReceive: {
            position : function(val) {
                this.map.setView(L.latLng(val[0],val[1]));
            },
            zoom : function(val) {
                var min = this.map.getMinZoom();
                var max = this.map.getMaxZoom();
                if(val < min) val = min;
                else if(val > max) val = max;
                this.map.setZoom(val);
            }
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
    
    function addEvents(layer) {
        
        var data = layer.feature.properties || {};
        
        API.listenHighlight(data, function(onOff){
            if(onOff) {
                if(layer instanceof L.Marker) {
                    layer.setIcon(redIcon);
                }
                else {
                    layer.setStyle({color: "#ff3300"});
                }
            }
            else {
                if(layer instanceof L.Marker) {
                    layer.setIcon(blueIcon);
                }
                else {
                    layer.setStyle({color: "0033ff"});
                }
            }
        }, false, this.module.getId());
        
        layer.addEventListener({
            "mouseover": function() {
                this.module.controller.hoverElement(data);
            },
            "mouseout": function() {
                API.highlight(data, 0);
            }
        }, this);
        
    }

    return view;
});