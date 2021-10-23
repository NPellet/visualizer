'use strict';

require.config({
  shim: {
    'components/leaflet/dist/leaflet': {
      exports: 'L',
      init: function () {
        return this.L.noConflict();
      }
    }
  }
});

define([
  'jquery',
  'modules/default/defaultview',
  'src/util/util',
  'src/util/api',
  'src/util/color',
  'components/leaflet/dist/leaflet',
  'components/leaflet-omnivore/leaflet-omnivore.min'
], function ($, Default, Util, API, Color, L, omnivore) {
  function View() {
    this.mapID = Util.getNextUniqueId();
  }

  Util.loadCss('components/leaflet/dist/leaflet.css');

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
    return new CustomIcon({ marker: marker, iconAnchor: marker.center });
  }

  function Marker(options) {
    var merged = (this.options = $.extend({}, Marker.defaultOptions, options));
    this.div = $('<div>');
    this.kind = merged.kind;
    switch (merged.kind) {
      case 'image':
        this.div = $(`<img src="${merged.img}">`);
        break;
      case 'circle':
        this.div.css('border-radius', merged.size);
      // eslint-disable-line no-fallthrough
      default:
        this.div.css('background', merged.color);
        break;
    }
    this.div.css({
      width: this.width,
      height: this.height
    });
  }

  Marker.defaultOptions = {
    size: 30,
    color: 'rgba(1,1,1,0.5)',
    kind: 'circle'
  };
  Marker.setDefaultOptions = function (options) {
    $.extend(Marker.defaultOptions, options);
  };
  Marker.prototype = {
    highlight: function (onOff) {
      if (onOff) {
        if (this.kind === 'image' && this.options.imgHighlight)
          this.div.attr('src', this.options.imgHighlight);
        else this.div.css('border', 'solid');
      } else {
        if (this.kind === 'image' && this.options.imgHighlight)
          this.div.attr('src', this.options.img);
        else this.div.css('border', 'none');
      }
    },
    get center() {
      if (this.kind === 'image') return [this.width / 2, this.height];
      else return [this.width / 2, this.height / 2];
    },
    get width() {
      return this.options.width || this.options.height || this.options.size;
    },
    get height() {
      return this.options.height || this.options.width || this.options.size;
    }
  };

  $.extend(true, View.prototype, Default, {
    init: function () {
      this.mapLayers = {};
      this.mapLayer = {};
      this.mapBounds = {};
      this.dom = $(`<div id="${this.mapID}"></div>`).css({
        height: '100%',
        width: '100%'
      });
      this.module.getDomContent().html(this.dom);

      // Construct default marker options
      Marker.setDefaultOptions({
        kind: this.module.getConfiguration('markerkind'),
        color: Color.getColor(this.module.getConfiguration('markercolor')),
        size: parseInt(this.module.getConfiguration('markersize'), 10),
        img: 'components/leaflet/dist/images/marker-icon.png',
        imgHighlight: 'modules/types/chart/maps/leaflet/marker-icon-red.png'
      });
      this.markerjpath = this.module.getConfiguration('markerjpath');
    },
    inDom: function () {
      this.dom.empty();
      var that = this;

      this.map = L.map(this.mapID, {
        zoomAnimation: false
      });

      this.getTileLayer().addTo(that.map);

      var firstZoom = true;

      function onZoom() {
        if (firstZoom) {
          // First zoom event is triggered by the initial setView. Ignore it
          firstZoom = false;
          return;
        }
        // First call the move handler in case zooming changed the center
        that.module.controller.moveAction.call(that);
        that.module.controller.zoomAction.call(that);
      }

      this.map.on('drag', that.module.controller.moveAction, that);
      this.map.on('zoomend', onZoom);

      var defaultCenter = [46.522117, 6.566144];
      var configCenter = this.module.getConfiguration('mapcenter');
      var promise;
      if (configCenter) promise = Promise.resolve(configCenter);
      else {
        promise = new Promise(function (resolve) {
          if (window.navigator && window.navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              function (geoposition) {
                resolve([
                  geoposition.coords.latitude,
                  geoposition.coords.longitude
                ]);
              },
              function () {
                resolve(defaultCenter);
              }
            );
          } else {
            resolve(defaultCenter);
          }
        });
      }
      promise.then(function (value) {
        var zoom = that.module.getConfiguration('mapzoom') || 10;
        that.map.setView(value, zoom);
        that.resolveReady();
      });
    },
    blank: {
      geojson: clearLayer,
      csv: clearLayer,
      kml: clearLayer,
      gpx: clearLayer,
      wkt: clearLayer,
      topojson: clearLayer,
      point: clearLayer
    },
    update: {
      position: function (value) {
        if (value.length < 2) return;
        this.map.setView(L.latLng(value[0], value[1]));
      },
      geojson: function (geo, varname) {
        try {
          var geoJson = geo.get();
          var converted = L.geoJson(geoJson, {
            pointToLayer: (feature, latlng) => {
              return L.circleMarker(latlng, {
                radius: 4,
                fillColor: '#0074D9',
                color: '#000000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              });
            },
            style: (feature) => {
              return feature.properties && feature.properties.style;
            }
          });
          this.addGeoJSON(converted, varname);
        } catch (e) {
          // do nothing
        }
        this.updateFit(varname);
      },
      csv: function (csv, varname) {
        try {
          this.addGeoJSON(omnivore.csv.parse(String(csv.get())), varname);
        } catch (e) {
          // do nothing
        }
        this.updateFit(varname);
      },
      kml: function (kml, varname) {
        try {
          this.addGeoJSON(omnivore.kml.parse(String(kml.get())), varname);
        } catch (e) {
          // do nothing
        }
        this.updateFit(varname);
      },
      gpx: function (gpx, varname) {
        try {
          this.addGeoJSON(omnivore.gpx.parse(String(gpx.get())), varname);
        } catch (e) {
          // do nothing
        }
        this.updateFit(varname);
      },
      wkt: function (wkt, varname) {
        try {
          this.addGeoJSON(omnivore.wkt.parse(String(wkt.get())), varname);
        } catch (e) {
          // do nothing
        }
        this.updateFit(varname);
      },
      topojson: function (topojson, varname) {
        try {
          this.addGeoJSON(omnivore.topojson.parse(topojson.get()), varname);
        } catch (e) {
          // do nothing
        }
        this.updateFit(varname);
      },

      point: function (point, varname) {
        var latlng = L.latLng(point[0], point[1]);
        var circle = L.circle(latlng, 20, {
          color: '#f00',
          fillColor: '#f00'
        });
        // circle.addTo(this.map);
        this.addLayer(circle, varname);
        this.updateFit(varname);
      }
    },

    addLayer: function (layer, varname) {
      layer.addTo(this.map);
      this.mapLayer[varname] = layer;
      this.mapBounds[varname] = new L.LatLngBounds();
      this.mapBounds[varname].extend(
        layer.getBounds ? layer.getBounds() : layer.getLatLng()
      );
    },

    addGeoJSON: function (geojson, varname) {
      this.map.addLayer(geojson);
      this.mapLayers[varname] = geojson;
      this.mapBounds[varname] = new L.LatLngBounds();
      geojson.eachLayer((layer) => {
        this.addEvents(layer, varname);
        this.mapBounds[varname].extend(
          layer.getBounds ? layer.getBounds() : layer.getLatLng()
        );
      });
    },
    updateFit: function (varname) {
      var fit = this.module.getConfiguration('autofit');
      var bounds;
      if (fit === 'var') {
        bounds = this.mapBounds[varname];
      } else if (fit === 'all') {
        bounds = new L.LatLngBounds();
        for (var i in this.mapBounds) {
          bounds.extend(this.mapBounds[i]);
        }
      }
      if (bounds && bounds.isValid()) {
        this.map.fitBounds(bounds);
      }
    },
    onResize: function () {
      this.map.invalidateSize();
    },
    onActionReceive: {
      position: function (val) {
        var currentCenter = this.map.getCenter();
        if (
          round(val[0]) !== round(currentCenter.lat) ||
          round(val[1]) !== round(currentCenter.lng)
        ) {
          this.map.setView(L.latLng(val[0], val[1]));
        }
      },
      zoom: function (val) {
        var min = this.map.getMinZoom();
        var max = this.map.getMaxZoom();
        if (val < min) val = min;
        else if (val > max) val = max;
        if (val !== this.map.getZoom()) {
          this.map.setZoom(val);
        }
      }
    },
    getTileLayer: function () {
      var baselayer = this.module.getConfiguration('maptiles') || 'osm';
      var tileLayer = { parameters: {} };
      switch (baselayer) {
        case 'hb':
          tileLayer.template =
            'http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png';
          break;
        case 'osm':
        default:
          tileLayer.template =
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
          tileLayer.parameters.attribution =
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
          break;
      }
      return L.tileLayer(tileLayer.template, tileLayer.parameters);
    }
  });

  function addEvents(layer, varname) {
    var data = layer.feature.properties || {};
    var that = this;

    this.module.data = data;

    var icon;
    if (layer instanceof L.Marker) {
      var options = {};
      if (DataObject.isDataObject(data)) {
        $.extend(options, data.getChildSync(this.markerjpath));
      }
      var marker = new Marker(options);
      icon = customIcon(marker);
      layer.setIcon(icon);
    }

    API.listenHighlight(
      data,
      function (onOff) {
        if (onOff) {
          if (layer instanceof L.Marker) {
            icon._marker.highlight(true);
          } else {
            layer.setStyle({ color: '#ff3300' });
          }
        } else {
          if (layer instanceof L.Marker) {
            icon._marker.highlight(false);
          } else {
            if (
              layer.feature &&
              layer.feature.properties &&
              layer.feature.properties.style
            ) {
              layer.setStyle(layer.feature.properties.style);
            } else {
              layer.setStyle({ color: '#0033ff' });
            }
          }
        }
      },
      false,
      `${this.module.getId()}_${varname}`
    );

    layer.addEventListener(
      {
        mouseover: function () {
          that.module.controller.hoverElement(data);
        },
        click: function () {
          that.module.controller.clickElement(data);
        },
        mouseout: function () {
          API.highlight(data, 0);
        }
      },
      this
    );
  }

  function clearLayer(varname) {
    API.killHighlight(`${this.module.getId()}_${varname}`);
    if (this.mapLayers.hasOwnProperty(varname)) {
      this.map.removeLayer(this.mapLayers[varname]);
      delete this.mapLayers[varname];
    }
    if (this.mapLayer.hasOwnProperty(varname)) {
      this.map.removeLayer(this.mapLayer[varname]);
    }
    if (this.mapBounds.hasOwnProperty(varname)) {
      delete this.mapBounds[varname];
    }
    this.updateFit();
  }

  function round(val) {
    return Math.floor(val * 1000);
  }

  return View;
});
