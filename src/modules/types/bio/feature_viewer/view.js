'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'BiojsCore',
  'jquery-ui/ui/widgets/slider',
  'BiojsDasProteinFeatureViewer'
], function (Default, Util, Biojs) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      if (!this.dom) {
        this._id = Util.getNextUniqueId();
        this.dom = $(` <div id="${this._id}"></div>`).css('height', '100%').css('width', '100%');
        this.module.getDomContent().html(this.dom);
      }
    },


    blank: {
      feature: function () {
        this.dom.empty();
      }
    },


    inDom: function () {
      this.resolveReady();
    },

    onResize: function () {
      this.dom.find('table').attr('width', this.dom.width());
    },


    update: {
      feature: function (data) {
        var that = this;
        var myPainter = new Biojs.MyFeatureViewer({
          target: this._id,
          json: data,
          imageWidth: 200
        });

        var dom = this.dom.find('svg').first();
        var viewbox = [0, 0, dom.attr('width'), dom.attr('height')];
        dom[0].setAttribute('viewBox', viewbox.join(' '));
        dom.attr('width', '100%');
        dom.attr('height', '100%');

        dom.parent().width('100%').height('100%');

        myPainter.onFeatureClick(function (data) {
          delete data.shape;
          that.module.controller.onFeatureClicked(data);
        });

        myPainter.onFeatureOn(function (data) {
          delete data.shape;
          that.module.controller.onFeatureMouseOver(data);
        });
      }
    },

    getDom: function () {
      return this.dom;
    }
  });

  return View;
});
