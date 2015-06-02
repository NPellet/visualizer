'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Panzoom',
        description: 'Panzoom',
        author: 'Daniel Kostro',
        date: '15.06.2014',
        license: 'MIT',
        cssClass: 'panzoom'
    };

    Controller.prototype.references = {
        picture: {
            type: ['picture', 'png', 'jpeg', 'jpg', 'gif'],
            label: 'A picture'
        },
        svg: {
            type: ['svg'],
            label: 'Inline svg'
        },
        pixel: {
            label: 'A pixel'
        },
        allpixel: {
            label: 'A hash map of pixels by varname'
        }
    };

    Controller.prototype.events = {
        click: {
            label: 'The image was clicked',
            refVariable: ['pixel', 'allpixel'],
            refAction: ['pixel']
        },
        hover: {
            label: 'A pixel was hovered',
            refVariable: ['pixel', 'allpixel'],
            refAction: ['pixel']
        }
    };

    Controller.prototype.variablesIn = ['picture', 'svg'];

    Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
        transform: 'Send transform to specific image',
        hide: 'Hide an image',
        show: 'Show an image'
    });

    Controller.prototype.configurationStructure = function () {
        var vars = [];
        var currentCfg = this.module.definition.vars_in;

        if (currentCfg) {

            var i = 0,
                l = currentCfg.length;

            for (; i < l; i++) {
                vars.push({
                    title: currentCfg[i].name,
                    key: currentCfg[i].name
                });
            }
        }

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },

                    fields: {}
                },

                img: {
                    options: {
                        type: 'table',
                        multiple: true
                    },

                    fields: {
                        variable: {
                            type: 'combo',
                            title: 'Variable In',
                            options: vars,
                            default: ''
                        },

                        opacity: {
                            type: 'text',
                            title: 'Opacity [0,1]',
                            default: '1'
                        },

                        order: {
                            type: 'text',
                            title: 'z-index',
                            default: ''
                        },
                        rendering: {
                            type: 'combo',
                            title: 'Rendering',
                            options: [
                                {key: 'default', title: 'Normal'},
                                {key: 'crisp-edges', title: 'Crisp edges'}
                            ],
                            default: ['default']
                        },
                        scaling: {
                            type: 'combo',
                            title: 'Scaling Method',
                            options: [
                                {
                                    key: 'max',
                                    title: 'Extend to 100% of available spcae'
                                },
                                {key: 'no', title: 'Keep original image size'}
                            ],
                            default: ['max']
                        },
                        rerender: {
                            type: 'checkbox',
                            title: 'Re-render on zoom',
                            options: {
                                yes: 'Yes'
                            },
                            default: []
                        }
                    }
                }
            }
        };
    };


    Controller.prototype.configAliases = {
        img: ['groups', 'img', 0]
    };

    Controller.prototype.clickedPixel = function (clickedPixel) {
        this.createDataFromEvent('click', 'pixel', clickedPixel);
    };

    Controller.prototype.allClickedPixels = function (allClickedPixels) {
        this.createDataFromEvent('click', 'allpixel', allClickedPixels);
    };

    Controller.prototype.hoverPixel = function (hoverPixel) {
        this.createDataFromEvent('hover', 'pixel', hoverPixel);
    };

    Controller.prototype.allHoverPixels = function (allHoverPixels) {
        this.createDataFromEvent('hover', 'allpixel', allHoverPixels);
    };

    return Controller;

});
