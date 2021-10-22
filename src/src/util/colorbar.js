'use strict';

define(['lodash', 'd3', 'src/util/util', 'chroma'], function (_, d3, Util, chroma) {
  let exports = {};

  const margin = 30;

  Util.loadCss('src/util/colorbar.css');

  exports.getColorScale = function (options) {
    let domain;
    let domMin = d3.min(options.domain);
    let domMax = d3.max(options.domain);
    // Default stop type is percent
    if (options.stopType !== 'values') {
      domain = options.stopPositions.map(function (v) {
        return domMin + v * (domMax - domMin);
      });
    } else {
      domain = _.cloneDeep(options.stopPositions);
    }

    // Normalize colors to be hexadecimal
    let stops = options.stops.map(function (c) {
      let ch = chroma(c);
      let r = {
        color: ch.hex(),
        opacity: ch.alpha()
      };

      return r;
    });
    // make sure that colors outside range have
    // the same color as the min/max of the domain
    domain.unshift(Number.MIN_VALUE);
    domain.push(Number.MAX_VALUE);
    stops.push(stops[stops.length - 1]);
    stops.unshift(stops[0]);

    return d3.scale.linear().domain(domain).range(stops);
  };

  exports.getSvg = function (options) {
    let el = $('<div>')[0];
    return exports.renderSvg(el, options);
  };

  exports.renderSvg = function (el, options) {
    let stopPositions;
    // Default stop type is percent
    let domMin = d3.min(options.domain);
    let domMax = d3.max(options.domain);
    if (options.stopType === 'values') {
      // convert values to percentages
      stopPositions = options.stopPositions.map(function (s) {
        return (s - domMin) / (domMax - domMin);
      });
    } else {
      stopPositions = options.stopPositions;
    }
    let orientation = getOrientation(options);
    let linearg = getGradientXY(orientation);
    let gradientWidth,
      totalWidth = options.width,
      gradientHeight,
      totalHeight = options.height;
    if (options.axis) {
      gradientHeight = totalHeight - margin;
      gradientWidth = totalWidth - margin;
    } else {
      gradientWidth = totalWidth;
      gradientHeight = totalHeight;
    }

    let svg = d3.select(el).append('svg')
      .attr('width', totalWidth)
      .attr('height', totalHeight);
    let id = Util.getNextUniqueId();
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
        return `${stopPositions[i] * 100}%`;
      })
      .style('stop-color', function (d) {
        return d;
      })
      .style('stop-opacity', 1);

    let g = svg.append('g')
      .attr('class', 'key')
      .attr('transform', function () {
        let tx = getTx(options);
        let ty = getTy(options);
        return `translate(${tx},${ty})`;
      });
    g.append('rect')
      .style('fill', `url(#${id})`)
      .attr('width', gradientWidth)
      .attr('height', gradientHeight);

    let x = d3.scale.linear()
      .domain(options.domain);
    if (!options.axis || !options.axis.tickValues) {
      x = x.nice();
    }
    x.range([0, (orientation === 'bottom' || orientation === 'top' ? gradientWidth : gradientHeight)]);
    if (hasAxis(options)) {
      let axis = d3.svg.axis()
        .scale(x)
        .orient(orientation)
        .tickSize(6);
      if (options.axis.ticks) {
        axis.ticks(options.axis.ticks);
      } else if (options.axis.tickValues) {
        axis.tickValues(options.axis.tickValues);
      }


      g.append('g')
        .attr('class', 'key')
        .attr('transform', function () {
          let tx = 0,
            ty = 0;
          if (orientation === 'bottom') {
            ty += gradientHeight;
          } else if (orientation === 'right') {
            tx += gradientWidth;
          }
          return `translate(${tx},${ty})`;
        })
        .call(axis);
    }


    return svg.html();
  };

  function getGradientXY(orientation) {
    if (orientation === 'left' || orientation === 'right') {
      return ['0%', '0%', '0%', '100%'];
    } else {
      return ['0%', '0%', '100%', '0%'];
    }
  }

  function getTx(options) {
    let tx = 0;
    let orientation = getOrientation(options);
    if (!hasAxis(options)) {
      return tx;
    }
    if (orientation === 'bottom' || orientation === 'top') {
      tx += margin / 2;
    }
    if (orientation === 'left') {
      tx += margin;
    }
    return tx;
  }

  function getTy(options) {
    let ty = 0;
    if (!hasAxis(options)) {
      return ty;
    }
    let orientation = getOrientation(options);
    if (orientation === 'left' || orientation === 'right') {
      ty += margin / 2;
    }
    if (orientation === 'top') {
      ty += margin;
    }
    return ty;
  }

  function getOrientation(options) {
    return options.orientation || options.axis && options.axis.orientation || 'top';
  }

  function hasAxis(options) {
    return !!options.axis;
  }

  return exports;
});
