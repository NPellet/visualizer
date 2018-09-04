'use strict';

define([
  'src/util/util',
  'src/util/ui',
  'src/util/debug',
  'lodash',
  'jquery',
  'modules/modulefactory'
], function (Util, ui, Debug, _, $, ModuleFactory) {
  function Rectangle(arg1) {
    var fail;
    if (arguments.length === 3) {
      this.init1.apply(this, arguments);
    } else if (arguments.length === 4) {
      this.init2.apply(this, arguments);
    } else if (arguments.length === 1 && arg1 instanceof Array) {
      if (arguments[0].length === 3)
        this.init1.apply(this, arguments[0]);
      else if (arguments.length === 4)
        this.init2.apply(this, arguments[0]);
      else
        fail = true;
    } else {
      fail = true;
    }
    if (fail) {
      throw new Error('Rectangle construction failed');
    }
  }

  Rectangle.prototype.init1 = function (minmin, width, height) {
    this.minmin = minmin;
    this.maxmax = { x: this.minmin.x + width, y: this.minmin.y + height };
    this.minmax = { x: this.minmin.x, y: this.maxmax.y };
    this.maxmin = { x: this.maxmax.x, y: this.maxmax.y };

    this._init();
  };

  Rectangle.prototype._init = function () {
    this.minx = this.minmin.x;
    this.maxx = this.maxmax.x;
    this.miny = this.minmin.y;
    this.maxy = this.maxmax.y;

    this.centerx = (this.minx + this.maxx) / 2;
    this.centery = (this.miny + this.maxy) / 2;
  };

  Rectangle.prototype.init2 = function () {
    var corners = arguments;
    var x = _.map(corners, 'x');
    var y = _.map(corners, 'y');
    for (var i = 0; i < corners.length; i++) {
      if (Math.max.apply(null, x) === corners[i].x && Math.max.apply(null, y) === corners[i].y)
        this.maxmax = corners[i];
      else if (Math.min.apply(null, x) === corners[i].x && Math.max.apply(null, y) === corners[i].y)
        this.minmax = corners[i];
      else if (Math.max.apply(null, x) === corners[i].x && Math.min.apply(null, y) === corners[i].y)
        this.maxmin = corners[i];
      else if (Math.min.apply(null, x) === corners[i].x && Math.min.apply(null, y) === corners[i].y)
        this.minmin = corners[i];
      else
        throw new Error('Rectangle initialisation failed');
    }
    this._init();
  };

  Rectangle.prototype.intersection = function (point) {
    var that = this,
      points;

    if (point.x !== this.centerx) {
      var a = (point.y - this.centery) / (point.x - this.centerx);
      var b = point.y - a * point.x;

      points = [
        { x: (this.miny - b) / a, y: this.miny },
        { x: (this.maxy - b) / a, y: this.maxy },
        { x: this.minx, y: a * this.minx + b },
        { x: this.maxx, y: a * this.maxx + b }
      ];

      points = _.filter(points, function (p) {
        return that.isInside(p);
      });
    } else {
      points = [
        { x: this.centerx, y: this.miny },
        { x: this.centerx, y: this.maxy }
      ];
    }


    var distances = _.map(points, function (p) {
      return distance(p, point);
    });

    var idx = distances.indexOf(Math.min.apply(null, distances));
    if (idx > -1) return points[idx];
    return null;
  };

  Rectangle.prototype.isInside = function (point) {
    return (point.x <= this.maxx && point.x >= this.minx && point.y <= this.maxy && point.y >= this.miny);
  };

  function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  var exports = {};
  var $diagram;

  function getLinks() {
    // targets are vars_in, sources are vars_out
    var sources = [],
      targets = [],
      links = [],
      i, j;
    var modules = ModuleFactory.getModules();
    for (i = 0; i < modules.length; i++) {
      var module = modules[i].definition;

      var vars_in = module.vars_in || [];
      for (j = 0; j < vars_in.length; j++) {
        var var_in = module.vars_in[j];
        if (!var_in.name) continue;
        targets.push({
          module: modules[i],
          id: DataObject.resurrect(module.id),
          name: var_in.name,
          rel: var_in.rel
        });
      }

      var vars_out = module.vars_out || [];
      for (j = 0; j < vars_out.length; j++) {
        var var_out = module.vars_out[j];
        if (!var_out.name || !var_out.event) continue;
        sources.push({
          id: DataObject.resurrect(module.id),
          filter: var_out.filter,
          name: var_out.name,
          event: var_out.event,
          jpath: var_out.jpath,
          rel: var_out.rel,
          module: modules[i]
        });
      }
    }
    for (let i = 0; i < targets.length; i++) {
      // Try to find source with same name
      var source = _.filter(sources, function (s) {
        return s.name === targets[i].name;
      });

      if (source) {
        for (j = 0; j < source.length; j++) {
          links.push({
            source: {
              module: source[j].module,
              id: source[j].id
            },
            target: {
              id: targets[i].id,
              module: targets[i].module
            },
            type: 'normal',
            filter: source[j].filter || 'no filter',
            event: source[j].event || 'no event',
            name: source[j].name || 'no name',
            jpath: source[j].jpath || [],
            rel_out: source[j].rel,
            rel_in: targets[j].rel
          });
        }
      }
      // else {
      //    links.push({
      //        source: {name: targets[i].name, rel: undefined, id: Util.getNextUniqueId(true)},
      //        target: targets[i],
      //        type: 'normal'
      //    });
      // }
    }

    for (let i = 0; i < sources.length; i++) {
      var target = _.filter(targets, function (t) {
        return t.name === sources[i].name;
      });

      if (!target.length) {
        Debug.warn(`The module ${sources[i].id} has a var_out ${sources[i].name} not used as an input of any other module`);
      }
    }
    return links;
  }

  function getNodes(links) {
    var width = 1400,
      height = 900;
    var nodes = {};
    links.forEach(function (link) {
      link.source = nodes[link.source.id] || (nodes[link.source.id] = { info: link.source });
      link.target = nodes[link.target.id] || (nodes[link.target.id] = { info: link.target });
    });
    var n = Object.keys(nodes).length,
      i = 0;
    for (var key in nodes) {
      // nodes[key].x = i*width/n + (Math.random()-0.5) * i/n/10 * width;
      // nodes[key].y = i*height/n + (Math.random()-0.5) *i/n/10 * height;
      nodes[key].x = Math.random() * width;
      nodes[key].y = Math.random() * height;
      i++;
    }
    return nodes;
  }


  exports.showVariableDiagram = function () {
    Promise.all([Util.require('d3'), Util.loadCss('src/util/diagram.css')]).then(function ([d3]) {
      var type = 'rect'; // Use circ or rect
      var links = getLinks();
      var nodes = getNodes(links);

      var width = 1400,
        height = 900,
        nodeRadius = 50,
        nodeBox;

      if (type === 'circ') {
        nodeBox = {
          width: nodeRadius * Math.sqrt(2), // Length of the biggest square in that circle
          height: nodeRadius * Math.sqrt(2),
          padding: '2px 8px 2px 8px'
        };
      } else {
        nodeBox = {
          width: 140,
          height: 90,
          padding: '2px 8px 2px 8px'
        };
      }

      var linkBox = {
        width: 150,
        height: 200
      };


      var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance((Math.max(nodeBox.width, nodeBox.height) + Math.max(linkBox.width, linkBox.height) * 1.7))
        .charge(-4000)
        .on('tick', tick)
        .start();

      $diagram = $('<div class="ci-diagram">');

      var zoom = d3.behavior.zoom()
        .scaleExtent([0.2, 10])
        .on('zoom', zoomed);

      var svg = d3.select($diagram[0]).append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('width', '100%')
        .attr('height', '100%');

      svg.append('g').append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'rgba(255,255,255,1')
        .style('stroke-width', 0)
        .call(zoom);

      svg = svg.append('g');

      // Per-type markers, as they don't inherit styles.
      svg.append('defs').selectAll('marker')
        .data(['normal'])
        .enter().append('marker')
        .attr('id', function (d) {
          return d;
        })
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 15)
        .attr('markerHeight', 15)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5');

      var path = svg.append('g').selectAll('path')
        .data(force.links())
        .enter().append('path')
        .attr('class', function (d) {
          return `link ${d.type}`;
        })
        .attr('marker-end', function (d) {
          return `url(#${d.type})`;
        });

      var node;
      if (type === 'circ') {
        node = svg.append('g').selectAll('circle')
          .data(force.nodes())
          .enter().append('circle')
          .attr('r', nodeRadius)
        // .call(zoom)
        // .call(drag)
          .call(force.drag);
      } else if (type === 'rect') {
        node = svg.append('g').selectAll('rect')
          .data(force.nodes())
          .enter().append('rect')
          .attr('width', nodeBox.width)
          .attr('height', nodeBox.height)
        // .call(zoom)
        // .call(drag)
          .call(force.drag);
      }
      // .call(drag1);


      var linkText = svg.append('g')
        .selectAll('foreignObject')
        .data(force.links())
        .enter()
        .append('foreignObject')
        .style('pointer-events', 'none')
        .attr('width', linkBox.width)
        .attr('height', linkBox.height);

      linkText
        .append('xhtml:div')
        .append('div')
        .style({
          display: 'flex',
          'align-items': 'center',
          height: `${linkBox.height}px`,
          width: `${linkBox.width}px`
        })
        .attr('class', 'arrow-text')
        .html(linkTextContent);

      var nodeText = svg.append('g')
        .selectAll('foreignObject')
        .data(force.nodes())
        .enter().append('foreignObject')
        .style('pointer-events', 'none')
        .attr({
          width: nodeBox.width,
          height: nodeBox.height
        });

      nodeText.append('xhtml:div')
        .append('div')
        .style({
          display: 'flex',
          height: `${nodeBox.height}px`,
          width: `${nodeBox.width}px`,
          padding: nodeBox.padding,
          'box-sizing': 'border-box'
        })
        .attr('class', 'node-text')
        .html(nodeTextContent);

      function zoomed() {
        svg.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`);
      }

      function nodeTextContent(d) {
        var res = [];
        res.push(`${d.info.module.controller ? d.info.module.controller.moduleInformation.name : 'unknown'}<br/>`);
        res.push(d.info.module.definition.title);

        return res.join('<br/>');
      }

      function linkTextContent(d) {
        var template = 'Event:&nbsp;<%= event %><br/>\nName:&nbsp;<%= name %><br/>\n<!--<% if(rel_out) { %> Ref out:&nbsp;<%= rel_out %><br/><% } %>-->\n<!--<% if(rel_in) { %> Ref in:&nbsp;<%= rel_in %><br/><% } %>-->\n<% if(jpath.length > 0) { %> <br/>jpath:&nbsp;<% print("[" + jpath.join(",") + "]"); %> <% } %>';
        var compiled = _.template(template);
        return compiled(DataObject.resurrect(d));
      }

      function tick() {
        path.attr('d', linkLine);
        node.attr('transform', transformNode);
        linkText.attr('transform', transformLink);
        nodeText.attr('transform', transformNodeText);
      }

      function linkArc(d) {
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y + -40}`;
      }

      function linkLine(d) {
        var target = getTargetPosition(d);
        return `M${target.from.x},${target.from.y}L${target.to.x} ${target.to.y}`;
      }

      function transformNode(d) {
        if (type === 'circ')
          return `translate(${d.x},${d.y})`;
        else
          return `translate(${d.x - nodeBox.width / 2},${d.y - nodeBox.height / 2})`;
      }

      function transformLink(d) {
        var target = getTargetPosition(d);
        return `translate(${(target.from.x + target.to.x) / 2 - linkBox.width / 2},${(target.from.y + target.to.y) / 2 - linkBox.height / 2})`;
      }

      function transformNodeText(d) {
        return `translate(${(d.x + d.x) / 2 - nodeBox.width / 2},${(d.y + d.y) / 2 - nodeBox.height / 2})`;
      }

      function getTargetPosition(d) {
        switch (type) {
          case 'circ':
            var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy);
            var factor = 1 - (nodeRadius / dr);
            return {
              from: {
                x: d.target.x - dx * factor,
                y: d.target.y - dy * factor
              },
              to: {
                x: d.source.x + dx * factor,
                y: d.source.y + dy * factor
              }
            };
          case 'rect':
            var sourceRect = new Rectangle({
              x: d.source.x - nodeBox.width / 2,
              y: d.source.y - nodeBox.height / 2
            }, nodeBox.width, nodeBox.height);

            var targetRect = new Rectangle({
              x: d.target.x - nodeBox.width / 2,
              y: d.target.y - nodeBox.height / 2
            }, nodeBox.width, nodeBox.height);

            return {
              from: sourceRect.intersection(d.target),
              to: targetRect.intersection(d.source)
            };
        }
      }

      var ww = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      var wh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      var f = 0.94;
      var dw, dh; // dialog height and width
      if (ww / width < wh / height) {
        dw = f * ww;
        dh = dw * height / width;
      } else {
        dh = f * wh;
        dw = dh * width / height;
      }

      ui.dialog($diagram, {
        width: dw,
        height: dh,
        noHeader: false,
        noWrap: true
      });
    });
  };

  return exports;
});
