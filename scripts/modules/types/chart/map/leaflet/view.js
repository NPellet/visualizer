define(['modules/defaultview', 'util/util', 'libs/leaflet/leaflet-src'], function(Default, Util) {

    function view() {
        this.mapID = Util.getNextUniqueId();
        this.mapLayers = {};
    }

    Util.loadCss('scripts/libs/leaflet/leaflet.css');

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
            this.map = L.map(this.mapID).setView(center, zoom);
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);
            this.onReady.resolve();
        },
        update: {
            'geo' : function(geo,varname) {
                if(this.mapLayers.hasOwnProperty(varname))
                    this.map.removeLayer(this.mapLayers[varname]);
                try {
                    var newMarker = L.geoJson(geo.get());
                    newMarker.addTo(this.map);
                    this.mapLayers[varname]=newMarker;
                } catch (e) {
                    console.error("error creating the marker");
                }
            }
        },
        onResize: function() {
            this.map.invalidateSize();
        }
    });

    return view;
});