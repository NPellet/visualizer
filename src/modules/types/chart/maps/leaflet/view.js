define(['modules/default/defaultview', 'src/util/util', 'src/util/api', 'components/leaflet/leaflet'], function(Default, Util, API, L) {

    function view() {
        this.mapID = Util.getNextUniqueId();
    }

    Util.loadCss('components/leaflet/leaflet.css');
    
    // Custom icon that accepts Marker objects
    var CustomIcon = L.Icon.extend({
        createIcon: function (oldIcon) {
            this._marker = this.options.marker;
            var div = this._marker.div[0];
            this._setIconStyles(div, 'icon');
            return div;
        },
        createShadow: function () {
                return null;
        }
    });
    function customIcon(marker) {
        return new CustomIcon({marker:marker,iconAnchor:marker.center});
    }
    
    function Marker(options) {
        var merged = (this.options = $.extend({},Marker.defaultOptions,options));
        this.div = $("<div>");
        this.kind = merged.kind;
        switch(merged.kind) {
            case "image":
                this.div = $('<img src="'+merged.img+'">');
                break;
            case "circle":
                this.div.css("border-radius", merged.size);
            default:
                this.div.css("background", merged.color);
                break;
        }
        this.div.css({
            width: this.width,
            height: this.height
        });
    }
    Marker.defaultOptions = {
        width: 30,
        color: "rgba(1,1,1,0.5)",
        kind: "circle"
    };
    Marker.setDefaultOptions = function(options) {
        $.extend(Marker.defaultOptions, options);
    };
    Marker.prototype = {
        highlight: function(onOff) {
            if(onOff) {
                if(this.kind==="image" && this.options.imgHighlight)
                    this.div.attr("src", this.options.imgHighlight);
                else
                    this.div.css("background","rgba(255,51,0,0.5)");
            } else {
                if(this.kind==="image" && this.options.imgHighlight)
                    this.div.attr("src", this.options.img);
                else
                    this.div.css("background",this.options.color);
            }
        },
        get center() {
            if(this.kind==="image")
                return [this.width/2,this.height];
            else
                return [this.width/2,this.height/2];
        },
        get width() {
            return (this.options.width||this.options.height);
        },
        get height() {
            return (this.options.height||this.options.width);
        }
    };

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            this.mapLayers = {};
            this.dom = $('<div id="' + this.mapID + '"></div>').css({
                height: '100%',
                width: '100%'
            });
            this.module.getDomContent( ).html(this.dom);
                
            API.killHighlight(this.module.getId());
            
            // Construct default marker options
            Marker.setDefaultOptions ({
                kind: this.module.getConfiguration('markerkind'),
                color: Util.getColor(this.module.getConfiguration('markercolor')),
                width: parseInt(this.module.getConfiguration('markersize')),
                img: 'components/leaflet/images/marker-icon.png',
                imgHighlight: 'modules/types/chart/maps/leaflet/marker-icon-red.png'
            });
            this.markerjpath = this.module.getConfiguration("markerjpath");
            
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
        this.module.data = data;
        
        var icon;
        if(layer instanceof L.Marker) {
            var options = {};
            if(data instanceof DataObject) {
                $.extend(options, data.getChildSync(this.markerjpath));
            }
            var marker = new Marker(options);
            icon = customIcon(marker);
            layer.setIcon(icon);
        }
        
        API.listenHighlight(data, function(onOff){
            if(onOff) {
                if(layer instanceof L.Marker) {
                    icon._marker.highlight(true);
                }
                else {
                    layer.setStyle({color: "#ff3300"});
                }
            }
            else {
                if(layer instanceof L.Marker) {
                    icon._marker.highlight(false);
                }
                else {
                    layer.setStyle({color: "#0033ff"});
                }
            }
        }, false, this.module.getId());
        
        layer.addEventListener({
            "mouseover": function() {
                this.module.controller.hoverElement(data);
            },
            "click": function() {
                this.module.controller.clickElement(data);
            },
            "mouseout": function() {
                API.highlight(data, 0);
            }
        }, this);
        
    }

    return view;
});