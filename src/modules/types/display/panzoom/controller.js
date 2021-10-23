'use strict';

define(['modules/default/defaultcontroller', 'lodash'], function (Default, _) {
  var transformChanged;

  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Panzoom',
    description: 'Panzoom',
    author: 'Daniel Kostro',
    date: '15.06.2014',
    license: 'MIT',
    cssClass: 'panzoom',
  };

  Controller.prototype.references = {
    picture: {
      type: ['picture', 'png', 'jpeg', 'jpg', 'gif', 'svg', 'string'],
      label: 'A picture (image url or typed svg)',
    },
    svg: {
      label: 'An svg',
    },
    image: {
      type: ['picture', 'png', 'jpeg', 'jpg', 'gif', 'string'],
      label: 'An image url',
    },
    pixel: {
      label: 'A pixel',
    },
    allpixel: {
      label: 'A hash map of pixels by varname',
    },
    transform: {
      label: 'A transform matrix (as a 6-element array)',
      type: 'array',
    },
  };

  Controller.prototype.events = {
    click: {
      label: 'The image was clicked',
      refVariable: ['pixel', 'allpixel'],
      refAction: ['pixel'],
    },
    hover: {
      label: 'A pixel was hovered',
      refVariable: ['pixel', 'allpixel'],
      refAction: ['pixel'],
    },
    transformChanged: {
      label: 'The image pan or zoom changed',
      refVariable: ['transform'],
      refAction: ['transform'],
    },
  };

  Controller.prototype.variablesIn = ['picture', 'image', 'svg'];

  Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
    hide: 'Hide an image',
    show: 'Show an image',
    transform: 'Set image transform',
    reset: 'Reset transform',
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
          key: currentCfg[i].name,
        });
      }
    }

    return {
      groups: {
        group: {
          options: {
            type: 'list',
          },

          fields: {
            highlightStrategy: {
              type: 'combo',
              title: 'Highlight behavior',
              options: [
                { title: 'No highlights', key: 'none' },
                { title: 'Pan to center', key: 'pan' },
                { title: 'Pan to center and zoom', key: 'panzoom' },
              ],
              default: 'none',
            },
            transformThrottling: {
              type: 'float',
              title: 'Throttle send transform',
              default: 0,
            },
          },
        },

        img: {
          options: {
            type: 'table',
            multiple: true,
          },

          fields: {
            variable: {
              type: 'combo',
              title: 'Variable In',
              options: vars,
              default: '',
            },

            opacity: {
              type: 'text',
              title: 'Opacity [0,1]',
              default: '1',
            },

            order: {
              type: 'text',
              title: 'z-index',
              default: '',
            },
            rendering: {
              type: 'combo',
              title: 'Rendering',
              options: [
                { key: 'default', title: 'Normal' },
                { key: 'crisp-edges', title: 'Crisp edges / Pixelated' },
              ],
              default: 'default',
            },
            scaling: {
              type: 'combo',
              title: 'Scaling Method',
              options: [
                {
                  key: 'max',
                  title: 'Extend to 100% of available space',
                },
                {
                  key: 'no',
                  title: 'Keep original image size',
                },
                {
                  key: 'maxIfLarge',
                  title:
                    'Normal if picture smaller than available space, 100% if not',
                },
              ],
              default: 'max',
            },
            rerender: {
              type: 'checkbox',
              title: 'Re-render on zoom',
              options: {
                yes: 'Yes',
              },
              default: [],
            },
          },
        },
      },
    };
  };

  Controller.prototype.configAliases = {
    img: ['groups', 'img', 0],
    highlightStrategy: ['groups', 'group', 0, 'highlightStrategy', 0],
    transformThrottling: ['groups', 'group', 0, 'transformThrottling', 0],
  };

  Controller.prototype.clickedPixel = function (clickedPixel) {
    this.createDataFromEvent('click', 'pixel', clickedPixel);
    this.sendActionFromEvent('click', 'pixel', clickedPixel);
  };

  Controller.prototype.allClickedPixels = function (allClickedPixels) {
    this.createDataFromEvent('click', 'allpixel', allClickedPixels);
  };

  Controller.prototype.hoverPixel = function (hoverPixel) {
    this.createDataFromEvent('hover', 'pixel', hoverPixel);
    this.sendActionFromEvent('hover', 'pixel', hoverPixel);
  };

  Controller.prototype.allHoverPixels = function (allHoverPixels) {
    this.lastHoverPixels = allHoverPixels;
    this.createDataFromEvent('hover', 'allpixel', allHoverPixels);
  };

  Controller.prototype.transformChanged = function (transformMatrix) {
    transformMatrix = transformMatrix.slice(0, 6);
    transformChanged(this, transformMatrix);
  };

  Controller.prototype.setTransformThrottling = function (throttling) {
    if (throttling > 0) {
      transformChanged = _.throttle(transformMatrix, throttling);
    } else {
      transformChanged = transformMatrix;
    }
  };

  Controller.prototype.export = function () {
    return this.module.view.export();
  };

  return Controller;
});

function transformMatrix(ctx, transformMatrix) {
  ctx.createDataFromEvent('transformChanged', 'transform', transformMatrix);
  ctx.sendActionFromEvent('transformChanged', 'transform', transformMatrix);
}
