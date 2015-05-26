'use strict';

requirejs.config({
    paths: {
        'd3-plugins': 'components/d3-plugins'
    },
    shim: {
        'd3-plugins': 'd3'
    }
});

define(['modules/default/defaultview', 'lodash', 'src/util/debug', 'src/util/util', 'd3', 'src/util/color', 'src/util/colorbar', 'src/util/ui', 'd3-plugins/hexbin/hexbin'], function (Default, _, Debug, Util, d3, colorUtil, colorbar, ui) {
    var DEFAULT_COLOR = 'lightblue';


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
            chart: function (value) {
                this.ignored = [];
                this.chart = value.get();
                var data = chartToArray(this.chart);
                this.originalData = data;
                this.coordinateSystem = this.module.getConfiguration('coordinateSystem');
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
            for (var i = 0; i < this.data.length; i++) {
                this.data[i] = addArray(this.data[i], multArray(this.origin, -1));
            }
        },

        _combinatorialBoundaries: function () {
            // compute boundaries for each axis
            var x = _.pluck(this.originalData, 0);
            var y = _.pluck(this.originalData, 1);
            var z = _.pluck(this.originalData, 2);

            this.combXmin = Math.min.apply(null, x);
            this.combYmin = Math.min.apply(null, y);
            this.combZmin = Math.min.apply(null, z);
            this.combXmax = Math.max.apply(null, x);
            this.combYmax = Math.max.apply(null, y);
            this.combZmax = Math.max.apply(null, z);

            this.combXYmax = Math.max(this.combXmax, this.combYmax);
            this.combXZmax = Math.max(this.combXmax, this.combZmax);
            this.combYZmax = Math.max(this.combYmax, this.combZmax);
        },

        _reMinMax: function (data) {
            this.minX = Math.min(this.minX, Math.min.apply(null, _.pluck(data, 0)));
            this.minY = Math.min(this.minY, Math.min.apply(null, _.pluck(data, 1)));
            this.maxX = Math.max(this.maxX, Math.max.apply(null, _.pluck(data, 0)));
            this.maxY = Math.max(this.maxX, Math.max.apply(null, _.pluck(data, 1)));
            this.lenX = this.maxX - this.minX;
            this.lenY = this.maxY - this.minY;
        },

        _normalize: function () {
            var x = _.pluck(this.data, 0);
            var y = _.pluck(this.data, 1);
            var minX = Math.min.apply(null, x);
            var minY = Math.min.apply(null, y);
            var maxX = Math.max.apply(null, x);
            var maxY = Math.max.apply(null, y);
            this.lenX = maxX - minX;
            this.lenY = maxY - minY;
            var min = Math.min(minX, minY);
            if (min % 2 !== 0) min = min - 1;
            this.normConstant = -min;

            for (var i = 0; i < this.data.length; i++) {
                this.data[i][0] += this.normConstant;
                this.data[i][1] += this.normConstant;
            }
            this.minX = minX + this.normConstant;
            this.minY = minY + this.normConstant;
            this.maxX = maxX + this.normConstant;
            this.maxY = maxY + this.normConstant;
        },

        _ignored: function () {
            var ignored = [];
            for (var i = 0; i < this.data.length; i++) {
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
            this.colorDomain = _.filter(this.color, function (v) {
                return !isNaN(v);
            });
            this.colorDomain = [Math.min.apply(null, this.colorDomain), Math.max.apply(null, this.colorDomain)];
            var gradient = this.module.getConfiguration('gradient');
            gradient = _.filter(gradient, function (v) {
                return v.stopPosition !== undefined;
            });
            this.stopPositions = _.pluck(gradient, 'stopPosition');
            this.stopColors = _(gradient).pluck('color').map(colorUtil.getColor).value();
            this.numberToColor = colorbar.getColorScale({
                stops: this.stopColors,
                stopPositions: this.stopPositions,
                domain: this.colorDomain
            });
            for (var i = 0; i < this.color.length; i++) {
                if (!isNaN(this.color[i])) {
                    this.color[i] = this.numberToColor(this.color[i]);
                    var r = this.color[i].match(/rgba?\(([^\)]*)\)/, 'i');
                    if (r) {
                        this.color[i] = colorUtil.getColor(r[1].split(','));
                    }
                }

            }
            this.color = this.color.map(function (val) {
                return val === undefined ? DEFAULT_COLOR : val;
            });
        },

        _chartData: function () {
            this.color = _.pluck(this.chart.data, 'color');
            this.label = _.pluck(this.chart.data, 'label');
            if (this.chart.axis) {
                this.axes = this.chart.axis;
            }
        },

        onResize: function () {
            //this.refresh();
            this.redraw();
        },

        draw: function () {
            var that = this;

            if (this.coordinateSystem === 'combinatorial' && this.axes) {
                // Generate 6 points;
                // x=0, y=0, z=0
                this.axeData = [
                    [this.combXmax + 1, 0, 0], [0, this.combYZmax + 1, this.combYZmax + 1],
                    [0, this.combYmax + 1, 0], [this.combXZmax + 1, 0, this.combXZmax + 1],
                    [0, 0, this.combZmax + 1], [this.combXYmax + 1, this.combXYmax + 1, 0]
                ];

                this.axeLabels = [
                    this.axes[0].name, this.axes[1].name + this.axes[2].name,
                    this.axes[1].name, this.axes[0].name + this.axes[2].name,
                    this.axes[2].name, this.axes[0].name + this.axes[1].name
                ];

                this.axeData = combinatorialToCubic(this.axeData);
                this.axeData = cubicToOddr(this.axeData);

                for (var i = 0; i < this.axeData.length; i++) {
                    this.axeData[i] = offsetArray(this.axeData[i], this.normConstant);
                }
                this._reMinMax(this.axeData);
            }

            this.redraw();
        },

        redraw: function() {
            if(!this.data) return;
            var that = this;
            this.reset();
            var r1 = this.dom.width() / (2 + this.lenX * 1.5);
            var r2 = this.dom.height() / ((this.lenX + 1) * 1.75);
            var hexRadius = Math.min(r1, r2);
            var points = [];
            for (var i = 0; i < this.data.length; i++) {
                points.push(toPixel(this.data[i]));
            }

            var boundingBox = _.flatten([toPixel([this.minX - 0.3, this.minY - 0.8]), toPixel([this.lenX + 1.5, this.lenY + 1.5])]);
            if(this.module.getConfigurationCheckbox('showColorBar', 'show')) {
                boundingBox[0] -= 100; // Keep some room for color bar
                boundingBox[2] += 100;
            }

            function toPixel(point) {
                return [point[0] * hexRadius * 1.75, point[1] * hexRadius * 1.5];
            }

            var width = this.width,
                height = this.height;

            var svg = d3.select('#' + this.id).append('svg')
                .attr('viewBox', boundingBox.join(','))
                .attr('width', width)
                .attr('height', height)
                .style('display', 'block')
                .append('g');

            if(this.module.getConfigurationCheckbox('showColorBar', 'show')) {
                var colorbarx = boundingBox[0];
                var colorbary = boundingBox[1];
                var svgMarkup = colorbar.getSvg({
                    width: 20,
                    height: boundingBox[3]-20,
                    axis: {
                        orientation: 'left',
                        ticks: 5,
                        order: 'asc'
                    },
                    stops: this.stopColors,
                    stopPositions: this.stopPositions,
                    domain: this.colorDomain
                });

                svgMarkup = '<g transform="translate(' + colorbarx + ',' + colorbary + ')">' + svgMarkup + '</g>';
                svg.html(svgMarkup);
            }



            var hexbin = d3.hexbin()
                .radius(hexRadius);

            // Generate axes
            // Combinatorial axes
            if (this.coordinateSystem === 'combinatorial') {
                var axePoints = [];
                for (i = 0; i < this.axeData.length; i++) {
                    axePoints.push(toPixel(this.axeData[i]));
                }
                axePoints = hexbin(axePoints);

                svg.append('g')
                    .selectAll('.axes')
                    .data(axePoints)
                    .enter().append('text')
                    .attr('class', 'axes')
                    .attr('x', function (d) {
                        return d.x;
                    })
                    .attr('y', function (d) {
                        return d.y;
                    })
                    .html(function (d, i) {
                        return that.axeLabels[i];
                    });

            }

            var hexbinPoints = hexbin(points);

            svg.append('g')
                .selectAll('.hexagon')
                .data(hexbinPoints)
                .enter().append('path')
                .attr('class', 'hexagon')
                .attr('d', function (d) {
                    return 'M' + d.x + ',' + d.y + hexbin.hexagon();
                })
                .attr('stroke', 'black')
                .attr('stroke-width', '1px')
                .style('fill', function (d, i) {
                    return that.color[i];
                });

            var nodeText = svg.append('g')
                .selectAll('foreignObject')
                .data(hexbinPoints)
                .enter().append('foreignObject')
                .style('pointer-events', 'none')
                .attr({
                    width: hexRadius,
                    height: hexRadius,
                    transform: function (d) {
                        return 'translate(' + (d.x - hexRadius / 2) + ',' + (d.y - hexRadius / 2) + ')';
                    }
                });

            nodeText.append('xhtml:div')
                .append('div')
                .style({
                    display: 'flex',
                    height: '' + hexRadius + 'px',
                    width: '' + hexRadius + 'px',
                    padding: 0,
                    'align-items': 'center',
                    'text-align': 'center',
                    'justify-content': 'center',
                    'box-sizing': 'border-box'
                })
                .html(function (d, i) {
                    return that.label[i];
                });


            // Zoom
            var zoom = d3.behavior.zoom()
                .scaleExtent([0.2, 10])
                .on('zoom', zoomed);

            //svg.call(zoom);

            function zoomed() {
                svg.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
            }
        },

        reset: function () {
            this.dom.html('');
        }
    });


    function chartToArray(chart) {
        try {
            var x = chart.data[0].x;
        } catch (e) {
            Debug.warn('no chart data');
            return [];
        }
        var result = [];

        var hasZ = (chart.data[0].z !== undefined);
        for (var i = 0; i < chart.data.length; i++) {
            var r = [chart.data[i].x, chart.data[i].y];
            if (hasZ) r.push(chart.data[i].z);
            result.push(r);
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
        var result = [];
        for (var i = 0; i < data.length; i++) {
            var v = data[i];
            var min = Math.min.apply(null, v);
            var max = Math.max.apply(null, v);
            if (min !== 0 || v.length !== 3) {
                result.push(undefined);
                continue;
            }

            var minIdx = v.indexOf(min);
            var maxIdx = v.indexOf(max);
            var middleIdx = ((minIdx + maxIdx) * 2) % 3;

            var r = [0, 0, 0];
            r = addArray(r, getComponent2(v, minIdx, middleIdx, maxIdx));
            r = addArray(r, getComponent1(v, minIdx, middleIdx, maxIdx));
            result.push(r);
        }
        return result;
    }

    function combinatorialToEvenq(data) {
        var r = combinatorialToCubic(data);
        r = cubicToEvenq(r);
        return r;
    }

    function cubicToEvenq(data) {
        var r = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
            if (!checkCubic(data[i])) continue;
            var col = data[i][0], z = data[i][2];
            var row = z + (col + (col & 1)) / 2;
            r[i] = [col, row];
        }
        return r;

    }

    function cubicToEvenr(data) {
        var r = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
            if (!checkCubic(data[i])) continue;
            var row = data[i][2], x = data[i][0];
            var col = x + (row + (row & 1)) / 2;
            r[i] = [col, row];
        }
        return r;
    }

    function cubicToOddr(data) {
        var r = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
            if (!checkCubic(data[i])) continue;
            var row = data[i][2], x = data[i][0];
            var col = x + (row - (row & 1)) / 2;
            r[i] = [col, row];
        }
        return r;
    }

    function cubicToOddq(data) {
        var r = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
            if (!checkCubic(data[i])) continue;
            var col = data[i][0], z = data[i][2];
            var row = z + (col - (col & 1)) / 2;
            r[i] = [col, row];
        }
        return r;
    }

    function addArray(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            throw new Error('Array not the same size in addition');
        }
        var r = arr1.slice(0);
        for (var i = 0; i < arr1.length; i++) {
            r[i] += arr2[i];
        }
        return r;
    }

    function multArray(arr, c) {
        var r = arr.slice(0);
        for (var i = 0; i < arr.length; i++) {
            r[i] *= c;
        }
        return r;
    }

    function offsetArray(arr, c) {
        var r = arr.slice(0);
        for (var i = 0; i < arr.length; i++) {
            r[i] += c;
        }
        return r;
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

    return View;
});


