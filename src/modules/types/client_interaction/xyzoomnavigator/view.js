'use strict';

define(['modules/default/defaultview', 'src/util/util', 'jquery'], function (Default, Util, $) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {
    init: function () {
      this.dom = $('<div />');
      var that = this;
      var img = $('<div class="ci-navigation-navigarrow"></div>');
      this.domNavig = $('<div />').addClass('ci-navigation-navig')
        .append(img.clone().addClass('top'))
        .append(img.clone().addClass('left'))
        .append(img.clone().addClass('right'))
        .append(img.clone().addClass('bottom'))
        .on('mousedown', '.ci-navigation-navigarrow', function (event) {
          that.moveStart(event);
        });

      this.domZoom = $('<div class="ci-navigation-navigzoom"></div>');

      this._zoomWidget = this.domZoom.slider({
        height: 100,
        orientation: 'vertical',
        min: 0,
        step: 0.01,
        max: 1,
        value: 0.5,
        slide: function (event, ui) {
          that.zoom(ui.value);
        }
      });

      this.dom.append(this.domNavig).append(this.domZoom);
      this.module.getDomContent().html(this.dom);
      this.cx = 0;
      this.cy = 0;
      this.step = 2;
      this.resolveReady();
    },

    update: {

      xycoords: function (value) {
        if (!value)
          return;
        this.cx = value[0];
        this.cy = value[1];
      },

      zoom: function (zoom) {
        if (!(zoom))
          return;
        this._zoom = zoom;
        if (this._zoomWidget.hasClass('ui-slider'))
          this._zoomWidget.slider('value', this._zoom);
      }

    },


    zoom: function (val) {
      this.module.controller.zoom(val);
    },

    moveStart: function (e) {
      var started = Date.now();
      // self.moveStart(event);

      var that = this;
      var target = $(e.target || e.srcElement);

      var mode = target.hasClass('top') ? 'top' : (target.hasClass('bottom') ? 'bottom' : (target.hasClass('left') ? 'left' : (target.hasClass('right') ? 'right' : 'top')));
      var timeout;

      var getInterval = function () {
        return 300000 / ((Date.now() - started) + 1500) + 10;
      };

      var execute = function () {
        if (mode == 'top')
          that.cy -= that.step;
        else if (mode == 'bottom')
          that.cy += that.step;
        else if (mode == 'left')
          that.cx -= that.step;
        else if (mode == 'right')
          that.cx += that.step;


        that.module.controller.move(that.cx, that.cy);
        setTimeout();
      };

      var setTimeout = function () {
        timeout = window.setTimeout(execute, getInterval());
      };

      var upHandler = function () {
        window.clearTimeout(timeout);
        $(document).unbind('mouseup', upHandler);
      };

      $(document).bind('mouseup', upHandler);

      execute();
    },

    onActionReceive: {
      changeXY: function (value) {
        this.cx = parseFloat(value);
      }
    }

  });

  return View;
});
