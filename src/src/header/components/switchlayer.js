'use strict';

define([
  'jquery',
  'src/header/components/default',
  'src/main/grid',
  'src/util/util',
], function ($, Default, Grid, Util) {
  function Element() {}

  var currentMenu;

  Util.inherits(Element, Default, {
    initImpl() {},

    _onClick() {
      var that = this;

      this.setStyleOpen(this._open);

      if (this._open) {
        if (currentMenu && currentMenu !== this && currentMenu._open) {
          currentMenu.onClick();
        }
        currentMenu = that;

        if (this.options.viewURL || this.options.dataURL) {
          this.load(this.options);
        }

        this.doElements();
      } else {
        this.close();
      }
    },

    doElements() {
      this.$_elToOpen = this._doElements(this.options.layers);
      this.open();
    },

    _doElements(layers) {
      if (!layers) {
        layers = Grid.getLayerNames();
      }

      var ul = $('<ul />') || this.$_elToOpen.empty(),
        i = 0,
        l = layers.length;

      for (; i < l; i++) {
        ul.append(this._buildSubElement(layers[i]));
      }

      return ul;
    },

    _buildSubElement(el) {
      var that = this,
        dom = $('<li />').text(el);
      dom.addClass('hasEvent').on('click', function () {
        Grid.switchToLayer(el);
        that.onClick();
      });
      return dom;
    },
  });

  return Element;
});
