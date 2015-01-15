'use strict';

define(['./point', './springs', './svg'], function (Point, Springs, SVG) {
    return {
        SVGElement: Point.SVGElement,
        Ellipse: Point.Ellipse,
        Image: Point.Image,
        Pie: Point.Pie,
        SpringLabels: Springs,
        SVG: SVG
    };
});
