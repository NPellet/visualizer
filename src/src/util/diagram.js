'use strict';

define(['src/util/util', 'src/util/ui', 'src/util/debug', 'lodash', 'jquery',  'modules/modulefactory', 'd3'], function (Util, ui, Debug, _, $,ModuleFactory, d3) {
    var exports = {};
    var $diagram;
    function getLinks() {
        // targets are vars_in, sources are vars_out
        var sources = [], targets = [], links = [], i, j;
        var modules = ModuleFactory.getModules();
        for(i=0; i<modules.length; i++) {
            var module = modules[i].definition;

            for(j=0; j<module.vars_in.length; j++) {
                var var_in = module.vars_in[j];
                if(!var_in.name) continue;
                targets.push({
                    module: modules[i],
                    id: DataObject.resurrect(module.id),
                    name: var_in.name,
                    rel: var_in.rel
                });
            }

            for(j=0; j<module.vars_out.length ; j++) {
                var var_out = module.vars_out[j];
                if(!var_out.name || !var_out.event) continue;
                if(var_out.event) {
                    console.log(event);
                }
                sources.push({
                    id: DataObject.resurrect(module.id),
                    filter: var_out.filter,
                    name: var_out.name,
                    event: var_out.event,
                    module: modules[i]
                });
            }
        }
        for(i=0; i<targets.length; i++) {
            // Try to find source with same name
            var source = _.filter(sources, function(s) {
                return s.name === targets[i].name;
            });

            if(source) {
                for(j=0; j<source.length; j++) {
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
                        name: source[j].name || 'no name'
                    })
                }
            }
            //else {
            //    links.push({
            //        source: {name: targets[i].name, rel: undefined, id: Util.getNextUniqueId(true)},
            //        target: targets[i],
            //        type: 'normal'
            //    });
            //}
        }

        for(i=0; i<sources.length; i++) {
            var target = _.filter(targets, function(t){
                return t.name === sources[i].name;
            });

            if(!target.length) {
                Debug.warn('The module ' + sources[i].id + ' has a var_out ' + sources[i].name + ' not used as an input of any other module');
            }
        }
        return links;
    }

    function getNodes(links) {
        var nodes = {};
        links.forEach(function(link) {
            link.source = nodes[link.source.id] || (nodes[link.source.id] = {info: link.source});
            link.target = nodes[link.target.id] || (nodes[link.target.id] = {info: link.target});
        });
        return nodes;
    }


    exports.showVariableDiagram = function() {
        Util.loadCss('src/util/diagram.css');
        var links = getLinks();
        var nodes = getNodes(links);

        var width = 1400,
            height = 900,
            nodeRadius = 50;

        var nodeBox = {
            width: nodeRadius,
            height: nodeRadius
        };

        var linkBox = {
            width: 150,
            height: 200
        };


        var force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(links)
            .size([width, height])
            .linkDistance((Math.max(nodeBox.width, nodeBox.height) + Math.max(linkBox.width, linkBox.height)*1.7))
            .charge(-4000)
            .on("tick", tick)
            .start();

        $diagram = $('<div class="ci-diagram">');

        var zoom = d3.behavior.zoom()
            .scaleExtent([0.2, 10])
            .on("zoom", zoomed);

        var svg = d3.select($diagram[0]).append("svg")
            .attr("viewBox", '0 0 ' + width + ' ' + height)
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
        svg.append("defs").selectAll("marker")
            .data(["normal"])
            .enter().append("marker")
            .attr("id", function(d) { return d; })
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 10)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5");

        var path = svg.append("g").selectAll("path")
            .data(force.links())
            .enter().append("path")
            .attr("class", function(d) { return "link " + d.type; })
            .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });


        var circle = svg.append("g").selectAll("circle")
            .data(force.nodes())
            .enter().append("circle")
            .attr("r", nodeRadius)
            //.call(zoom)
            //.call(drag)
            .call(force.drag)
        //.call(drag1);


        var linkText = svg.append("g")
            .selectAll('foreignObject')
            .data(force.links())
            .enter()
            .append("foreignObject")
            .attr("width", linkBox.width)
            .attr("height", linkBox.height);

        linkText
            .append("xhtml:body")
            .append('div')
            .style({
                display: 'flex',
                'align-items': 'center',
                height: '' + linkBox.height + 'px',
                width: '' + linkBox.width + 'px'
            })
            .append('div')
            .style('flex', 1)
            .attr('class', 'rect')
            .html(linkTextContent);

        var nodeText = svg.append("g")
            .selectAll('foreignObject')
            .data(force.nodes())
            .enter().append('foreignObject')
            .attr({
                width: nodeBox.width,
                height: nodeBox.height
            });

        nodeText.append('xhtml:body')
            .append('div')
            .style({
                display: 'flex',
                'align-items': 'center',
                height: '' + nodeRadius + 'px',
                width: '' + nodeRadius + 'px'
            })
            .attr('class', 'node-text')
            .html(nodeTextContent);

        function zoomed() {
            console.log('zoomed');
            svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        function nodeTextContent(d) {
            var res = [];
            res.push(d.info.module.controller ? d.info.module.controller.moduleInformation.name : 'unknown');
            res.push(d.info.module.definition.title);

            return res.join('<br/>');
        }

        function linkTextContent(d) {
            var template = 'Event: <%= event %><br/> Name: <%= name %>';
            var compiled = _.template(template);
            return compiled(DataObject.resurrect(d));
        }
// Use elliptical arc path segments to doubly-encode directionality.
        function tick() {
            path.attr("d", linkLine);
            circle.attr("transform", transform);
            linkText.attr('transform', transformLink);
            nodeText.attr('transform', transformNode);
        }

        function linkArc(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + d.source.x  + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x  + "," + (d.target.y + -40);
        }

        function linkLine(d) {
            var target = getTargetPosition(d);
            return "M" + target.from.x  + "," + target.from.y + "L" + target.to.x + ' ' + target.to.y
        }

        function transform(d) {
            return "translate(" + d.x + "," + d.y + ")";
        }

        function transformLink(d) {
            var target = getTargetPosition(d);
            return "translate(" + ((target.from.x + target.to.x)/2 - linkBox.width/2) + ',' + ((target.from.y + target.to.y)/2 - linkBox.height/2) + ')';
        }

        function transformNode(d) {
            return "translate(" + ((d.x + d.x)/2 - nodeBox.width/2) + ',' + ((d.y + d.y)/2 - nodeBox.height/2) + ')';
        }

        function getTargetPosition(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            var factor = 1-(nodeRadius / dr);
            return {
                from: {
                    x: d.target.x - dx*factor,
                    y: d.target.y - dy*factor
                },
                to: {
                    x: d.source.x + dx*factor,
                    y: d.source.y + dy*factor
                }
            };
        }


        ui.dialog($diagram, {
            width: width,
            height: height,
            noHeader: true,
            noWrap: true
        });
    };

    return exports;
});