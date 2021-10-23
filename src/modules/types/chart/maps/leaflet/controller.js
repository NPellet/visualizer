'use strict';

define(['modules/default/defaultcontroller', 'src/util/api'], function (Default, API) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Leaflet map',
    description: 'Display a map with objects in it',
    author: 'Michaeël Zasso',
    date: '11.01.2014',
    license: 'MIT'
  };

  Controller.prototype.references = {
    geojson: {
      type: ['geojson', 'object'],
      label: 'A GeoJSON object'
    },
    viewport: {
      type: ['geojson', 'object'],
      label: 'Current map view'
    },
    position: {
      label: 'Geo coordinates',
      type: 'array'
    },
    zoom: {
      label: 'Zoom level',
      type: 'number'
    },
    item: {
      label: 'Object on the map',
      type: 'object'
    },
    csv: {
      label: 'CSV with latitude and longitude columns',
      type: 'string'
    },
    kml: {
      label: 'KML',
      type: 'string'
    },
    gpx: {
      label: 'GPX',
      type: 'string'
    },
    wkt: {
      label: 'WKT',
      type: 'string'
    },
    topojson: {
      label: 'TopoJSON'
    },
    point: {
      label: 'A point (object with latitude and longitude)',
      type: 'array'
    }
  };

  Controller.prototype.events = {
    onMapMove: {
      label: 'The map has moved',
      refAction: ['position'],
      refVariable: ['viewport']
    },
    onZoomChange: {
      label: 'The zoom level has changed',
      refAction: ['zoom']
    },
    onHoverElement: {
      label: 'Hovers an object',
      refVariable: ['item']
    },
    onClickElement: {
      label: 'Click an object',
      refVariable: ['item']
    }
  };

  Controller.prototype.variablesIn = ['geojson', 'csv', 'kml', 'gpx', 'wkt', 'topojson', 'position', 'point'];

  Controller.prototype.actionsIn = {
    position: 'Move the map',
    zoom: 'Change zoom'
  };

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            title: 'Map',
            type: 'list'
          },
          fields: {
            maptiles: {
              type: 'combo',
              title: 'Base tile source',
              options: [
                { title: 'OpenStreetMap', key: 'osm' },
                { title: 'HikeBike', key: 'hb' }
              ],
              default: 'osm'
            },
            mapcenter: {
              type: 'text',
              title: 'Default center'
            },
            mapzoom: {
              type: 'slider',
              title: 'Default zoom',
              min: 0,
              max: 19,
              step: 1,
              default: '10'
            },
            autofit: {
              type: 'combo',
              title: 'Autofit map',
              options: [
                { title: 'No fit', key: 'nofit' },
                { title: 'Fit around everything', key: 'all' },
                { title: 'Fit around current variable', key: 'var' }
              ],
              default: 'nofit'
            }
          }
        },
        markers: {
          options: {
            title: 'Markers',
            type: 'list',
            multiple: false
          },
          fields: {
            markerjpath: {
              type: 'combo',
              title: 'Marker JPath',
              options: this.module.model.getjPath('item')
            },
            markerkind: {
              type: 'combo',
              title: 'Default marker kind',
              options: [
                { title: 'Square', key: 'square' },
                { title: 'Circle', key: 'circle' },
                { title: 'Image', key: 'image' }
              ],
              default: 'image'
            },
            markercolor: {
              type: 'color',
              title: 'Default marker color',
              default: 'rgba(0,51,255,0.5)'
            },
            markersize: {
              type: 'text',
              title: 'Default marker size',
              default: '30'
            }
          }
        }
      }
    };
  };

  Controller.prototype.configFunctions = {
    mapcenter: function (cfg) {
      var split = cfg.split(',');
      return [parseFloat(split[0]), parseFloat(split[1])];
    }
  };

  Controller.prototype.configAliases = {
    mapcenter: ['groups', 'group', 0, 'mapcenter', 0],
    mapzoom: ['groups', 'group', 0, 'mapzoom', 0],
    maptiles: ['groups', 'group', 0, 'maptiles', 0],
    autofit: ['groups', 'group', 0, 'autofit', 0],
    markerjpath: ['groups', 'markers', 0, 'markerjpath', 0],
    markerkind: ['groups', 'markers', 0, 'markerkind', 0],
    markercolor: ['groups', 'markers', 0, 'markercolor', 0],
    markersize: ['groups', 'markers', 0, 'markersize', 0]
  };

  Controller.prototype.hoverElement = function (data) {
    this.createDataFromEvent('onHoverElement', 'item', data);
    API.highlight(data, 1);
  };

  Controller.prototype.clickElement = function (data) {
    this.createDataFromEvent('onClickElement', 'item', data);
  };

  Controller.prototype.moveAction = function () {
    var center = this.map.getCenter();

    this.module.controller.sendActionFromEvent('onMapMove', 'position', [center.lat, center.lng]);

    boundUpdate.call(this);
  };

  Controller.prototype.zoomAction = function () {
    this.module.controller.sendActionFromEvent('onZoomChange', 'zoom', this.map.getZoom());

    boundUpdate.call(this);
  };

  function boundUpdate() {
    var map = this.map;
    this.module.controller.createDataFromEvent('onMapMove', 'viewport', null, function () {
      var bounds = map.getBounds();
      var arr = new Array(4);

      arr[0] = getGeoCoords(bounds.getSouthWest());
      arr[1] = getGeoCoords(bounds.getNorthWest());
      arr[2] = getGeoCoords(bounds.getNorthEast());
      arr[3] = getGeoCoords(bounds.getSouthEast());

      return new DataObject({
        type: 'geojson',
        value: {
          type: 'Feature', geometry: {
            type: 'Polygon',
            coordinates: [arr]
          }
        }
      });
    });
  }

  function getGeoCoords(latLng) { // return coordinates in geojson order
    return [latLng.lng, latLng.lat];
  }

  return Controller;
});
