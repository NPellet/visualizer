'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        moduleName: '2D NMR',
        description: 'Display 2D NMRs using the plot library',
        author: 'Norman Pellet',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: '2dnmr'
    };

    Controller.prototype.references = {
        jcampx: {
            type: 'jcamp',
            label: 'Jcamp on top axis'
        },
        jcampy: {
            type: 'jcamp',
            label: 'Jcamp on left axis'
        },
        jcampxy: {
            type: 'jcamp',
            label: 'Jcamp on left and top axis'
        },
        jcamp2d: {
            type: 'jcamp',
            label: '2D Jcamp'
        },
        annotations: {
            type: 'array',
            label: 'Annotation file'
        }
    };

    Controller.prototype.variablesIn = [ 'jcampx', 'jcampy', 'jcampxy', 'jcamp2d', 'annotations' ];

    return Controller;

});
