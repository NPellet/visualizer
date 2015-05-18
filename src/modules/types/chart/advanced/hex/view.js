'use strict';

requirejs.config({
    paths: {
        'd3-plugins': 'components/d3-plugins'
    },
    shim: {
        'd3-plugins': 'd3'
    }
});

define(['modules/default/defaultview', 'lodash', 'src/util/debug', 'src/util/util', 'd3', 'd3-plugins/hexbin/hexbin'], function (Default, _, Debug, Util, d3) {
    var DEFAULT_COLOR = 'lightblue';


    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {
            console.log('init');

        },
        inDom: function () {
            this.id = Util.getNextUniqueId();
            this.dom = $('<div>').attr('id', this.id).css({
                width: '99%',
                height: '99%'
            });
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
                var coordinateSystem = this.module.getConfiguration('coordinateSystem');
                this.layout = 'vertical';
                switch(coordinateSystem) {
                    case 'combinatorial':
                        this.originalData = data;
                        this.data = combinatorialToCubic(data);
                        this.cubicData = this.data;
                        this.data = cubicToOddr(this.data);
                        break;
                    default:
                        this.data = data;
                        break;
                }
                this._chartData();
                this._ignored();
                this._normalize();
                debugger;
                this.draw();
            }
        },

        _normalize: function() {
            var x = _.pluck(this.data, 0);
            var y = _.pluck(this.data, 1);
            var minX = Math.min.apply(null, x);
            var minY = Math.min.apply(null, y);
            var min = Math.min(minX,minY);
            if(min%2 !== 0) min = min-1;

            for(var i=0; i<this.data.length; i++) {
                this.data[i][0] -= min;
                this.data[i][1] -= min;
            }

        },

        _ignored: function() {
            var ignored = [];
            for(var i=0; i<this.data.length; i++) {
                if(this.data[i] === undefined) {
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

            this.color = this.color.map(function(val) {
                return val || DEFAULT_COLOR;
            });
        },

        _chartData: function() {
            this.color = _.pluck(this.chart.data, 'color');
            this.label = _.pluck(this.chart.data, 'label');
        },

        onResize: function (width, height) {

        },

        draw: function () {
            var that = this;


            var hexRadius = d3.min([this.dom.width()/((10 + 0.5) * Math.sqrt(3)),
                this.dom.height()/((10 + 1/3) * 1.5)]);
            var points = [];
            for(var i=0; i<this.data.length; i++) {
                points.push([hexRadius * this.data[i][1] * 1.75, hexRadius * this.data[i][0] * 1.5]);
            }


            var margin = {
                top: 20 + hexRadius/2, bottom: 30 + hexRadius/2,
                left: 40 + hexRadius/2, right: 20 + hexRadius/2
            };

            var width = this.dom.width() - margin.left -margin.right,
                height = this.dom.height() - margin.top - margin.bottom;

            var svg = d3.select('#' + this.id).append('svg')
                .attr('viewBox', '-150, -150, 600, 600')
                .style('margin', 0)
                .style('padding',0)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var hexbin = d3.hexbin()
                .radius(hexRadius);

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
                .style('fill', function(d, i) {
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
                    transform: function(d) {
                        return 'translate(' + (d.x - hexRadius/2)+ ',' + (d.y - hexRadius/2) + ')';
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
                .html(function(d,i) {
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

        reset: function() {
            this.dom.html('');
        }
    });


    function chartToArray(chart) {
        try{
            var x=chart.data[0].x;
        } catch(e) {
            Debug.warn('no chart data');
            return [];
        }
        var result = [];

        var hasZ = (chart.data[0].z !== undefined);
        for(var i=0; i<chart.data.length; i++) {
            var r = [chart.data[i].x, chart.data[i].y];
            if(hasZ) r.push(chart.data[i].z);
            result.push(r);
        }
        return result;
    }

    function checkCubic(v) {
        if(v===undefined || v.length !== 3 || v[0] + v[1] + v[2] !== 0) {
            return false;
        }
        return true;
    }

    function combinatorialToCubic(data) {
        var result = [];
        for(var i=0; i<data.length; i++) {
            var v = data[i];
            var min = Math.min.apply(null, v);
            var max = Math.max.apply(null, v);
            if(min !== 0 || v.length !== 3) {
                result.push(undefined);
                continue;
            }

            var minIdx = v.indexOf(min);
            var maxIdx = v.indexOf(max);
            var middleIdx = ((minIdx + maxIdx)*2)%3;

            var r = [0,0,0];
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
        for(var i=0; i<data.length; i++) {
            if(!checkCubic(data[i])) continue;
            var col = data[i][0], z = data[i][2];
            var row = z + (col + (col&1)) / 2;
            r[i] = [row, col];
        }
        return r;

    }

    function cubicToEvenr(data) {
        var r = new Array(data.length);
        for(var i=0; i<data.length; i++) {
            if(!checkCubic(data[i])) continue;
            var row = data[i][2], x = data[i][0];
            var col = x + (row + (row&1)) / 2;
            r[i] = [row, col];
        }
        return r;
    }

    function cubicToOddr(data) {
        var r = new Array(data.length);
        for(var i=0; i<data.length; i++) {
            if(!checkCubic(data[i])) continue;
            var row = data[i][2], x = data[i][0];
            var col = x + (row - (row&1)) / 2;
            r[i] = [row, col];
        }
        return r;
    }

    function cubicToOddq(data) {
        var r = new Array(data.length);
        for(var i=0; i<data.length; i++) {
            if(!checkCubic(data[i])) continue;
            var col = data[i][0], z = data[i][2];
            var row = z + (col - (col&1)) / 2;
            r[i] = [row, col];
        }
        return r;
    }

    function addArray(arr1, arr2) {
        if(arr1.length !== arr2.length) {
            throw new Error('Array not the same size in addition');
        }
        var r = arr1.slice(0);
        for(var i=0; i<arr1.length; i++) {
            r[i] += arr2[i];
        }
        return r;
    }

    function multArray(arr, c) {
        var r = arr.slice(0);
        for(var i=0; i<arr.length; i++) {
            r[i] *= c;
        }
        return r;
    }

    function offsetArray(arr, c) {
        var r = arr.slice(0);
        for(var i=0; i<arr.length; i++) {
            r[i] += c;
        }
        return r;
    }

    function getComponent1(arr, minIdx, middleIdx, maxIdx) {
        if(minIdx === middleIdx) {
            return [0,0,0];
        }
        if(middleIdx === 0 && maxIdx === 1 || middleIdx === 1 && maxIdx === 0) {
            return multArray([1,-1,0], arr[middleIdx]);
        }
        if(middleIdx === 1 && maxIdx === 2 || middleIdx ===2 && maxIdx === 1) {
            return multArray([0, 1, -1], arr[middleIdx]);
        }
        return multArray([-1, 0, 1], arr[middleIdx]);
    }

    function getComponent2(arr, minIdx, middleIdx, maxIdx) {
        if(middleIdx === maxIdx) {
            return [0,0,0];
        }

        if(maxIdx === 0) {
            return multArray([0, -1, 1], arr[maxIdx] - arr[middleIdx]);
        }

        if(maxIdx === 1) {
            return multArray([1,0,-1], arr[maxIdx] - arr[middleIdx]);
        }

        return multArray([-1, 1, 0], arr[maxIdx] - arr[middleIdx]);
    }

    return View;
});


