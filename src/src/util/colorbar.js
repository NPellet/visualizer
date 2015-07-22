'use strict';

define(['d3', 'src/util/util', 'chroma'], function (d3, Util, chroma) {
    var exports = {};

    Util.loadCss('src/util/colorbar.css');

    exports.getColorScale = function (options) {
        var domMin = d3.min(options.domain);
        var domMax = d3.max(options.domain);
        var domain = options.stopPositions.map(function (v) {
            return domMin + v * (domMax - domMin);
        });
        // Normalize colors to be hexadecimal
        var stops = options.stops.map(function (c) {
            return chroma(c).hex();
        });
        return d3.scale.linear().domain(domain).range(stops);
    };

    exports.getSvg = function (options) {
        var el = $('<div>')[0];
        return exports.renderSvg(el, options);
    };

    exports.renderSvg = function (el, options) {
        var linearg = getGradientXY(options.axis.orientation);
        var margin = 30;
        var totalWidth = options.width + margin;
        var totalHeight = options.height + margin;
        var svg = d3.select(el).append('svg')
            .attr('width', totalWidth)
            .attr('height', totalHeight);
        var id = Util.getNextUniqueId();
        svg.append('defs').append('linearGradient')
            .attr({
                x1: linearg[0],
                y1: linearg[1],
                x2: linearg[2],
                y2: linearg[3],
                id: id
            })
            .selectAll('stop')
            .data(options.stops)
            .enter().append('stop')
            .attr('offset', function (d, i) {
                return '' + (options.stopPositions[i] * 100) + '%';
            })
            .style('stop-color', function (d) {
                return d;
            })
            .style('stop-opacity', 1);

        var g = svg.append('g')
            .attr('class', 'key')
            .attr('transform', function () {
                var tx = 0;
                var ty = 0;
                var r = 'translate(';
                if (options.axis.orientation === 'left' || options.axis.orientation === 'right') {
                    ty += margin / 2;
                } else if (options.axis.orientation === 'bottom' || options.axis.orientation === 'top') {
                    tx += margin / 2;
                }
                if (options.axis.orientation === 'left') {
                    tx += margin;
                }
                if (options.axis.orientation === 'top') {
                    ty += margin;
                }
                return 'translate(' + tx + ',' + ty + ')';
            });
        g.append('rect')
            .style('fill', 'url(#' + id + ')')
            .attr('width', options.width)
            .attr('height', options.height);


        var x = d3.scale.linear()
            .domain(options.domain).nice()
            .range([0, (options.axis.orientation === 'bottom' || options.axis.orientation === 'top' ? options.width : options.height)]);
        var axis = d3.svg.axis()
            .scale(x)
            .orient(options.axis.orientation)
            .tickSize(6)
            .ticks(options.axis.ticks);
        g.append('g')
            .attr('class', 'key')
            .attr('transform', function () {
                var tx = 0, ty = 0;
                if (options.axis.orientation === 'bottom') {
                    ty += options.height;
                } else if (options.axis.orientation === 'right') {
                    tx += options.width;
                }
                return 'translate(' + tx + ',' + ty + ')';
            })
            .call(axis);

        return svg.html();
    };

    function getGradientXY(orientation) {
        if (orientation === 'left' || orientation === 'right') {
            return ['0%', '0%', '0%', '100%'];
        } else {
            return ['0%', '0%', '100%', '0%'];
        }

    }

    return exports;
});
