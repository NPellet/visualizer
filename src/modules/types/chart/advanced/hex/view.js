'use strict';

require.config({
  paths: {
    'd3-plugins': 'components/d3-plugins'
  },
  shim: {
    'd3-plugins': 'd3'
  }
});

define(['modules/default/defaultview', 'lodash', 'src/util/debug', 'src/util/util', 'd3', 'src/util/color', 'src/util/colorbar', 'src/util/ui', 'd3-plugins/hexbin/hexbin'], function (Default, _, Debug, Util, d3, colorUtil, colorbar, ui) {
  let DEFAULT_COLOR = 'lightblue';


  function View() {
  }

  View.prototype = $.extend(true, {}, Default, {
    init: function () {
    },
    inDom: function () {
      this.id = Util.getNextUniqueId();
      this.dom = ui.getSafeElement('div').attr('id', this.id);
      this.module.getDomContent().html(this.dom);
      this.resolveReady();
    },
    blank: {
      chart: function () {
        this.reset();
      }
    },
    update: {
      // Chart format expected
      // Color and labels should be in chart.data[].info[].color
      //                               chart.data[].info[].label
      chart: function (value) {
        this.ignored = [];
        this.chart = value.get();
        let data = chartToArray(this.chart);
        this.originalData = data;
        this.coordinateSystem = this.module.getConfiguration('coordinateSystem');
        this.axesType = this.module.getConfiguration('axesType');
        this.layout = 'vertical';
        switch (this.coordinateSystem) {
          case 'combinatorial':
            this.origin = [
              this.module.getConfiguration('originX'),
              this.module.getConfiguration('originY'),
              this.module.getConfiguration('originZ')
            ];
            this.data = data;
            this._substractOrigin();
            this._combinatorialBoundaries(this.data);
            this.data = combinatorialToCubic(this.data);
            this.cubicData = this.data;
            this.data = cubicToOddr(this.data);
            break;
          default:
            this.data = data;
            break;
        }
        // Extract data from chart object
        this._chartData();
        // Ignore invalid data
        this._ignored();
        // Normalize data (positive values)
        this._normalize();
        // Convert numbers to colors and use default when needed
        this._processColors();

        this.draw();
      }
    },

    _substractOrigin: function () {
      for (let i = 0; i < this.data.length; i++) {
        this.data[i] = addArray(this.data[i], multArray(this.origin, -1));
      }
    },

    _combinatorialBoundaries: function () {
      // compute boundaries for each axis
      let x = _.map(this.originalData, 0);
      let y = _.map(this.originalData, 1);
      let z = _.map(this.originalData, 2);

      this.combXmin = Math.min.apply(null, x);
      this.combYmin = Math.min.apply(null, y);
      this.combZmin = Math.min.apply(null, z);
      this.combXmax = Math.max.apply(null, x);
      this.combYmax = Math.max.apply(null, y);
      this.combZmax = Math.max.apply(null, z);

      this.combXYmax = commonMax(x, y);
      this.combXZmax = commonMax(x, z);
      this.combYZmax = commonMax(y, z);

      // this.combXYmax = Math.max(this.combXmax, this.combYmax);
      // this.combXZmax = Math.max(this.combXmax, this.combZmax);
      // this.combYZmax = Math.max(this.combYmax, this.combZmax);
    },

    _reMinMax: function (data) {
      this.minX = Math.min(this.minX, Math.min.apply(null, _.map(data, 0)));
      this.minY = Math.min(this.minY, Math.min.apply(null, _.map(data, 1)));
      this.maxX = Math.max(this.maxX, Math.max.apply(null, _.map(data, 0)));
      this.maxY = Math.max(this.maxX, Math.max.apply(null, _.map(data, 1)));
      this.lenX = this.maxX - this.minX;
      this.lenY = this.maxY - this.minY;
    },

    _normalize: function () {
      let x = _.map(this.data, 0);
      let y = _.map(this.data, 1);
      let minX = Math.min.apply(null, x);
      let minY = Math.min.apply(null, y);
      let maxX = Math.max.apply(null, x);
      let maxY = Math.max.apply(null, y);
      this.lenX = maxX - minX;
      this.lenY = maxY - minY;
      let min = Math.min(minX, minY);
      if (min % 2 !== 0) min = min - 1;
      this.normConstant = -min;

      for (let i = 0; i < this.data.length; i++) {
        this.data[i][0] += this.normConstant;
        this.data[i][1] += this.normConstant;
      }
      this.minX = minX + this.normConstant;
      this.minY = minY + this.normConstant;
      this.maxX = maxX + this.normConstant;
      this.maxY = maxY + this.normConstant;
    },

    _ignored: function () {
      let ignored = [];
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i] === undefined) {
          ignored.push(i);
        }
      }

      this.totalSize = this.data.length;
      this.realSize = this.data.length - ignored.length;
      _.pullAt(this.data, ignored);
      _.pullAt(this.color, ignored);
      _.pullAt(this.cubicData, ignored);
      _.pullAt(this.originalData, ignored);
      _.pullAt(this.label, ignored);
    },

    _processColors: function () {
      let gradient = this.module.getConfiguration('gradient');
      let stopType = this.module.getConfiguration('stopType');
      gradient = _.filter(gradient, (v) => v.stopPosition !== undefined);
      this.stopPositions = _.map(gradient, 'stopPosition');

      if (stopType === 'percent') {
        this.colorDomain = _.filter(this.color, (v) => !isNaN(v));
        this.colorDomain = [Math.min.apply(null, this.colorDomain), Math.max.apply(null, this.colorDomain)];
      } else { // means values
        this.colorDomain = [Math.min.apply(null, this.stopPositions), Math.max.apply(null, this.stopPositions)];
      }


      this.stopColors = _(gradient).map('color').map(colorUtil.getColor).value();
      this.numberToColor = colorbar.getColorScale({
        stops: this.stopColors,
        stopPositions: this.stopPositions,
        domain: this.colorDomain,
        stopType: stopType
      });
      for (let i = 0; i < this.color.length; i++) {
        if (!isNaN(this.color[i])) {
          let c = this.numberToColor(this.color[i]);
          this.color[i] = c.color;
          this.opacity[i] = c.opacity;
        }
      }
      this.color = this.color.map(function (val) {
        return val === undefined ? DEFAULT_COLOR : val;
      });

      this.opacity = this.opacity.map(function (val) {
        return val === undefined ? 1 : val;
      });
    },

    _fontSize: function (px) {
      let maxFontSize = 50;

      function findFontSize(text) {
        let arr = text.split('\n');
        let n = arr.reduce(function (p, c) {
          return Math.max(p, c.length);
        }, 0);
        n = Math.max(n, arr.length);
        return n ? px / n * 2 : maxFontSize;
      }

      let fontSize;
      if (!(fontSize = this.module.getConfiguration('fontSize'))) {
        fontSize = this.label.reduce(function (prev, current) {
          if (!current) return prev;
          return Math.min(prev, findFontSize(current));
        }, maxFontSize);
      }
      return `${fontSize | 0}px`;
    },

    _chartData: function () {
      this.color = [];
      this.label = [];
      this.opacity = [];
      for (let i = 0; i < this.chart.data.length; i++) {
        let d = this.chart.data[i];
        this.color.push(_.map(d.info, 'color'));
        this.label.push(_.map(d.info, 'label'));
        this.opacity.push(_.map(d.info, 'opacity'));
      }
      this.color = _.flatten(this.color);
      this.label = _.flatten(this.label);
      this.opacity = _.flatten(this.opacity);
      if (this.chart.axis) {
        this.axes = this.chart.axis;
      }
    },

    onResize: function () {
      this.redraw();
    },

    draw: function () {
      if (this.coordinateSystem === 'combinatorial' && this.axes && this.axesType !== 'none') {
        // Combinatorial coordinate system
        //      ZY  Y
        //       \ /
        //  Z --  O -- XY
        //       / \
        //      ZX  X
        //
        // [X, ZY, Y, ZX, Z, XY]

        // Generate 6 points;
        // x=0, y=0, z=0
        this.axeData = {};
        let pointOffset = 3;
        this.axeData.points = [
          [this.combXmax + pointOffset, 0, 0], [0, this.combYZmax + pointOffset, this.combYZmax + pointOffset],
          [0, this.combYmax + pointOffset, 0], [this.combXZmax + pointOffset, 0, this.combXZmax + pointOffset],
          [0, 0, this.combZmax + pointOffset], [this.combXYmax + pointOffset, this.combXYmax + pointOffset, 0]
        ];

        let startOffset = 1;
        let endOffset = 2;
        this.axeData.startPoints = [
          [this.combXmax + startOffset, 0, 0], [0, this.combYZmax + startOffset, this.combYZmax + startOffset],
          [0, this.combYmax + startOffset, 0], [this.combXZmax + startOffset, 0, this.combXZmax + startOffset],
          [0, 0, this.combZmax + startOffset], [this.combXYmax + startOffset, this.combXYmax + startOffset, 0]
        ];

        this.axeData.endPoints = [
          [this.combXmax + endOffset, 0, 0], [0, this.combYZmax + endOffset, this.combYZmax + endOffset],
          [0, this.combYmax + endOffset, 0], [this.combXZmax + endOffset, 0, this.combXZmax + endOffset],
          [0, 0, this.combZmax + endOffset], [this.combXYmax + endOffset, this.combXYmax + endOffset, 0]
        ];

        this.axeLabels = [
          this.axes[0].name, this.axes[1].name + this.axes[2].name,
          this.axes[1].name, this.axes[0].name + this.axes[2].name,
          this.axes[2].name, this.axes[0].name + this.axes[1].name
        ];

        this.axeData.points = combinatorialToCubic(this.axeData.points);
        this.axeData.points = cubicToOddr(this.axeData.points);
        this.axeData.startPoints = combinatorialToCubic(this.axeData.startPoints);
        this.axeData.startPoints = cubicToOddr(this.axeData.startPoints);
        this.axeData.endPoints = combinatorialToCubic(this.axeData.endPoints);
        this.axeData.endPoints = cubicToOddr(this.axeData.endPoints);

        for (let i = 0; i < this.axeData.points.length; i++) {
          this.axeData.points[i] = offsetArray(this.axeData.points[i], this.normConstant);
          this.axeData.startPoints[i] = offsetArray(this.axeData.startPoints[i], this.normConstant);
          this.axeData.endPoints[i] = offsetArray(this.axeData.endPoints[i], this.normConstant);
        }
        this._reMinMax(this.axeData.points);
      }

      this.redraw();
    },

    redraw: function () {
      if (!this.data || this.data.length === 0) return;
      let that = this;
      this.reset();
      let r1 = this.dom.width() / (2 + this.lenX * 1.5);
      let r2 = this.dom.height() / ((this.lenX + 1) * 1.75);
      let hexRadius = Math.min(r1, r2);
      let points = [];
      for (var i = 0; i < this.data.length; i++) {
        points.push(toPixel(this.data[i]));
      }

      let boundingBox = _.flatten([toPixel([this.minX - 0.3, this.minY - 0.8]), toPixel([this.lenX + 1.5, this.lenY + 1.5])]);
      if (this.module.getConfigurationCheckbox('showColorBar', 'show')) {
        boundingBox[0] -= 100; // Keep some room for color bar
        boundingBox[2] += 100;
      }

      function toPixel(point) {
        return [point[0] * hexRadius * 1.75, point[1] * hexRadius * 1.5];
      }

      let width = this.width,
        height = this.height;

      let motherSvg = d3.select(`#${this.id}`).append('svg')
        .attr('viewBox', boundingBox.join(','))
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block');


      let svg = motherSvg.append('g');

      let tickMode = this.module.getConfiguration('tickMode');
      let tickNumber = this.module.getConfiguration('tickNumber');
      let tickValues = (this.module.getConfiguration('tickValues') || '')
        .split(',').map(function (v) {
          return +v;
        });

      if (this.module.getConfigurationCheckbox('showColorBar', 'show')) {
        let colorbarx = boundingBox[0];
        let colorbary = boundingBox[1];
        let svgMarkup = colorbar.getSvg({
          width: 50,
          height: boundingBox[3] * 0.95 - 20,
          axis: {
            orientation: 'left',
            ticks: tickMode === 'auto' ? tickNumber : undefined,
            tickValues: tickMode === 'manual' ? tickValues : undefined,
            order: 'asc'
          },
          stops: this.stopColors,
          stopPositions: this.stopPositions,
          domain: this.colorDomain,
          stopType: this.module.getConfiguration('stopType')
        });

        svgMarkup = `<g transform="translate(${colorbarx},${colorbary})">${svgMarkup}</g>`;
        svg.html(svgMarkup);
      }


      let hexbin = d3.hexbin()
        .radius(hexRadius);

      let fontSize = that._fontSize(hexRadius);

      // Generate axes
      // Combinatorial axes
      if (this.coordinateSystem === 'combinatorial' && this.axes) {
        // Arrow definition
        svg.append('defs').selectAll('marker')
          .data(['normal'])
          .enter().append('marker')
          .attr('id', function (d) {
            return d;
          })
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 10)
          .attr('refY', 0)
          .attr('markerWidth', 10)
          .attr('markerHeight', 10)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,-4L10,0L0,4');

        if (this.axesType === 'graph') {
          // draw coordinates on the graph
          let axePoints = [];
          let startAxePoints = [];
          let endAxePoints = [];
          for (i = 0; i < this.axeData.points.length; i++) {
            axePoints.push(toPixel(this.axeData.points[i]));
            startAxePoints.push(toPixel(this.axeData.startPoints[i]));
            endAxePoints.push(toPixel(this.axeData.endPoints[i]));
          }
          startAxePoints = hexbin(startAxePoints);
          endAxePoints = hexbin(endAxePoints);
          axePoints = hexbin(axePoints);

          // Axe text
          svg.append('g')
            .selectAll('.axes')
            .data(axePoints)
            .enter().append('foreignObject')
            .style('pointer-events', 'none')
            .attr({
              width: hexRadius,
              height: hexRadius
            })
            .attr('transform', function (d) {
              return `translate(${d.x - hexRadius / 2},${d.y - hexRadius / 2})`;
            })
            .append('xhtml:div')
            .append('div')
            .style({
              display: 'flex',
              height: `${hexRadius}px`,
              width: `${hexRadius}px`,
              'box-sizing': 'border-box',
              'align-items': 'center',
              'font-size': fontSize
            })
            .attr('class', 'axe-text')
            .html(function (d, i) {
              return that.axeLabels[i];
            });

          // axe arrows
          svg.append('g')
            .selectAll('.axe-arrow')
            .data(axePoints)
            .enter()
            .append('path')
            .attr('class', 'axe-arrow')
            .attr('marker-end', 'url(#normal)')
            .attr('d', function (d, i) {
              return `M${startAxePoints[i].x},${startAxePoints[i].y}L${endAxePoints[i].x} ${endAxePoints[i].y}`;
            });
        } else if (this.axesType === 'legend') {
          let radText = 30;
          let radArr = 20;
          let legendTextPoints = getLegendData(radText);
          let legendEndPoints = getLegendData(radArr);
          let legendStartPoints = fillArray({ x: 0, y: 0 }, 6);
          let legendSize = 20;

          // Legend text
          svg.append('g').attr('class', 'abcd')
            .selectAll('.axes-legend')
            .data(legendTextPoints)
            .enter().append('foreignObject')
            .style('pointer-events', 'none')
            .attr({
              width: legendSize,
              height: legendSize
            })
            .attr('transform', function (d) {
              return `translate(${d.x - boundingBox[0] - legendSize / 2},${d.y + boundingBox[1] + radText - legendSize / 2})`;
            })
            .append('xhtml:div')
            .append('div')
            .style({
              display: 'flex',
              height: `${hexRadius}px`,
              width: `${hexRadius}px`,
              'box-sizing': 'border-box',
              'font-size': 16,
              'align-items': 'center'
            })
            .attr('class', 'axe-corner-text')
            .html(function (d, i) {
              return that.axeLabels[i];
            });

          // Legend arrows
          svg.append('g')
            .selectAll('.axe-arrow-legend')
            .data(legendStartPoints)
            .enter()
            .append('path')
            .attr('class', 'axe-arrow-legend')
            .attr('marker-end', 'url(#normal)')
            .attr('d', function (d, i) {
              return `M${legendStartPoints[i].x - boundingBox[0] - 4},${legendStartPoints[i].y + boundingBox[1] + radText}L${legendEndPoints[i].x - boundingBox[0] - 4} ${legendEndPoints[i].y + boundingBox[1] + radText}`;
            });
        }
      }

      // Generate hexgons
      let hexbinPoints = hexbin(points);

      svg.append('g')
        .selectAll('.hexagon')
        .data(hexbinPoints)
        .enter().append('path')
        .attr('class', 'hexagon')
        .attr('d', function (d) {
          return `M${d.x},${d.y}${hexbin.hexagon()}`;
        })
        .attr('stroke', 'black')
        .attr('stroke-width', '1px')
        .style('fill', function (d, i) {
          return that.color[i];
        })
        .style('fill-opacity', function (d, i) {
          return that.opacity[i];
        });

      let nodeText = svg.append('g')
        .selectAll('foreignObject')
        .data(hexbinPoints)
        .enter().append('foreignObject')
        .style('pointer-events', 'none')
        .attr({
          width: hexRadius,
          height: hexRadius,
          transform: function (d) {
            return `translate(${d.x - hexRadius / 2},${d.y - hexRadius / 2})`;
          }
        });

      nodeText.append('xhtml:div')
        .append('div')
        .style({
          display: 'flex',
          height: `${hexRadius}px`,
          width: `${hexRadius}px`,
          padding: 0,
          'align-items': 'center',
          'justify-content': 'center',
          'box-sizing': 'border-box',
          'font-size': fontSize
        })
        .html(function (d, i) {
          return that.label[i];
        });


      // Zoom
      if (this.module.getConfigurationCheckbox('enableZoom', 'yes')) {
        let zoom = d3.behavior.zoom()
          .scaleExtent([0.2, 10])
          .on('zoom', zoomed);

        motherSvg.call(zoom).on('dblclick.zoom', function () {
          zoom.scale(1);
          zoom.translate([0, 0]);
          zoom.event(motherSvg);
        });
      }


      function zoomed() {
        svg.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`);
      }
    },

    reset: function () {
      this.dom.html('');
    }
  });

  function chartToArray(chart) {
    try {
      let x = chart.data[0].x;
    } catch (e) {
      Debug.warn('no chart data');
      return [];
    }
    let result = [];

    // Series of the chart object are merged
    let hasZ = (chart.data[0].z !== undefined);
    for (let i = 0; i < chart.data.length; i++) {
      for (let j = 0; j < chart.data[i].x.length; j++) {
        let r = [chart.data[i].x[j], chart.data[i].y[j]];
        if (hasZ) r.push(chart.data[i].z[j]);
        result.push(r);
      }
    }

    return result;
  }

  function checkCubic(v) {
    if (v === undefined || v.length !== 3 || v[0] + v[1] + v[2] !== 0) {
      return false;
    }
    return true;
  }

  function combinatorialToCubic(data) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
      let v = data[i];
      let min = Math.min.apply(null, v);
      let max = Math.max.apply(null, v);
      if (min !== 0 || v.length !== 3) {
        result.push(undefined);
        continue;
      }

      let minIdx = v.indexOf(min);
      let maxIdx = v.indexOf(max);
      let middleIdx = ((minIdx + maxIdx) * 2) % 3;

      let r = [0, 0, 0];
      r = addArray(r, getComponent2(v, minIdx, middleIdx, maxIdx));
      r = addArray(r, getComponent1(v, minIdx, middleIdx, maxIdx));
      result.push(r);
    }
    return result;
  }

  function combinatorialToEvenq(data) {
    let r = combinatorialToCubic(data);
    r = cubicToEvenq(r);
    return r;
  }

  function cubicToEvenq(data) {
    let r = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      if (!checkCubic(data[i])) continue;
      let col = data[i][0],
        z = data[i][2];
      let row = z + (col + (col & 1)) / 2;
      r[i] = [col, row];
    }
    return r;
  }

  function cubicToEvenr(data) {
    let r = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      if (!checkCubic(data[i])) continue;
      let row = data[i][2],
        x = data[i][0];
      let col = x + (row + (row & 1)) / 2;
      r[i] = [col, row];
    }
    return r;
  }

  function cubicToOddr(data) {
    let r = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      if (!checkCubic(data[i])) continue;
      let row = data[i][2],
        x = data[i][0];
      let col = x + (row - (row & 1)) / 2;
      r[i] = [col, row];
    }
    return r;
  }

  function cubicToOddq(data) {
    let r = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      if (!checkCubic(data[i])) continue;
      let col = data[i][0],
        z = data[i][2];
      let row = z + (col - (col & 1)) / 2;
      r[i] = [col, row];
    }
    return r;
  }

  function addArray(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      throw new Error('Array not the same size in addition');
    }
    let r = arr1.slice(0);
    for (let i = 0; i < arr1.length; i++) {
      r[i] += arr2[i];
    }
    return r;
  }

  function multArray(arr, c) {
    let r = arr.slice(0);
    for (let i = 0; i < arr.length; i++) {
      r[i] *= c;
    }
    return r;
  }

  function offsetArray(arr, c) {
    let r = arr.slice(0);
    for (let i = 0; i < arr.length; i++) {
      r[i] += c;
    }
    return r;
  }

  function fillArray(d, l) {
    let arr = new Array(l);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = d;
    }
    return arr;
  }

  function getComponent1(arr, minIdx, middleIdx, maxIdx) {
    if (minIdx === middleIdx) {
      return [0, 0, 0];
    }
    if (middleIdx === 0 && maxIdx === 1 || middleIdx === 1 && maxIdx === 0) {
      return multArray([1, -1, 0], arr[middleIdx]);
    }
    if (middleIdx === 1 && maxIdx === 2 || middleIdx === 2 && maxIdx === 1) {
      return multArray([0, 1, -1], arr[middleIdx]);
    }
    return multArray([-1, 0, 1], arr[middleIdx]);
  }

  function getComponent2(arr, minIdx, middleIdx, maxIdx) {
    if (middleIdx === maxIdx) {
      return [0, 0, 0];
    }

    if (maxIdx === 0) {
      return multArray([0, -1, 1], arr[maxIdx] - arr[middleIdx]);
    }

    if (maxIdx === 1) {
      return multArray([1, 0, -1], arr[maxIdx] - arr[middleIdx]);
    }

    return multArray([-1, 1, 0], arr[maxIdx] - arr[middleIdx]);
  }

  function commonMax(a, b) {
    let m = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] === b[i] && a[i] > m) m = a[i];
    }
    return m;
  }

  function getLegendData(rad) {
    return [
      { x: rad * Math.cos(-Math.PI / 3), y: rad * Math.sin(Math.PI / 3) },
      { x: rad * Math.cos(Math.PI * 2 / 3), y: rad * Math.sin(-Math.PI * 2 / 3) },
      { x: rad * Math.cos(Math.PI / 3), y: rad * Math.sin(-Math.PI / 3) },
      { x: rad * Math.cos(-Math.PI * 2 / 3), y: rad * Math.sin(Math.PI * 2 / 3) },
      { x: rad * Math.cos(Math.PI), y: rad * Math.sin(Math.PI) },
      { x: rad * Math.cos(0), y: rad * Math.sin(0) }
    ];
  }

  return View;
});

