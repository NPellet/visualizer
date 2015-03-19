'use strict';

define(['modules/default/defaultview', 'src/util/util', 'lib/d3/d3.layout.cloud'], function (Default, Util, d3) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {
            this._id = Util.getNextUniqueId();
            var html = '<div class="layout-cloud" id="' + this._id + '"></div>';

            this.dom = $(html).css({
                height: '100%',
                width: '100%'
            });


            //this.spiral
            //scale
            //orientation
            //oneWordPerLine
            //fromTo = this.module.getConfigurationCheckbox('options', 'hide');
            //this.preventHighlight = this.module.getConfigurationCheckbox('options', 'hide');
            //this.preventHighlight = this.module.getConfigurationCheckbox('options', 'hide');
            //this.preventHighlight = this.module.getConfigurationCheckbox('options', 'hide');
            //this.preventHighlight = this.module.getConfigurationCheckbox('options', 'hide');

            this.module.getDomContent().html(this.dom);

        },
        blank: {
            value: function () {
                this.dom.empty();
            }
        },
        update: {
            value: function (value) {
                this.redrawChart(value);
            }
        },
        onActionReceive: {

        },
        inDom: function () {
            this.resolveReady();
        },
        onResize: function () {
            this.parcoords && this.parcoords.width(this.width).height(this.height).resize().render();
        },
        redrawChart: function(value){

            var w = this.width,
                h = this.height;
            var layout = d3.layout.cloud()
                .timeInterval(10)
                .size([w, h])
                .fontSize(function(d) { console.log(d); return 50;/*fontSize(+d.value);*/ })
                .text(function(d) {console.log(d); return d; })
                //.on("word", progress)
                .on("end", draw);

            layout.stop().words(value).start();


            var svg = d3.select("#"+this._id).append("svg")
                .attr("width", w)
                .attr("height", h);

            var background = svg.append("g"),
                vis = svg.append("g")
                    .attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

            function draw(data, bounds) {
               // statusText.style("display", "none");
                var scale = bounds ? Math.min(
                    w / Math.abs(bounds[1].x - w / 2),
                    w / Math.abs(bounds[0].x - w / 2),
                    h / Math.abs(bounds[1].y - h / 2),
                    h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;
                var words = data;
                var text = vis.selectAll("text")
                    .data(words, function(d) { return d.text.toLowerCase(); });
                text.transition()
                    .duration(1000)
                    .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
                    .style("font-size", function(d) { return d.size + "px"; });
                text.enter().append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
                    .style("font-size", "1px")
                    .transition()
                    .duration(1000)
                    .style("font-size", function(d) { return d.size + "px"; });
                text.style("font-family", function(d) { return d.font; })
                 //   .style("fill", function(d) { return fill(d.text.toLowerCase()); })
                    .text(function(d) { return d.text; });
                var exitGroup = background.append("g")
                    .attr("transform", vis.attr("transform"));
                var exitGroupNode = exitGroup.node();
                text.exit().each(function() {
                    exitGroupNode.appendChild(this);
                });
                exitGroup.transition()
                    .duration(1000)
                    .style("opacity", 1e-6)
                    .remove();
                vis.transition()
                    .delay(1000)
                    .duration(750)
                    .attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
            }
        }
    });

    return View;

});