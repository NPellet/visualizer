'use strict';

define(['modules/default/defaultview', 'src/util/util', 'jquery'], function (Default, Util, $) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {
    init: function () {
      this.dom = $('<div />');
      var that = this;
      var img = $('<div class="ci-navigation-navigarrow"></div>');
      this.domNavig = $('<div />').addClass('')
        .append(img.clone().addClass('left'))
        .append(img.clone().addClass('right'))
        .on('mousedown', '.ci-navigation-navigarrow', function (event) {
          that.moveStart(event);
        });

      this.dom.append(this.domNavig);
      this.module.getDomContent().html(this.dom);
      this.cx = 0;
      this.step = this.module.getConfiguration('step') || 2;
      this.resolveReady();
    },

    update: {

      xcoords: function (value) {
        if (!value) {
          return;
        }

        this.cx = value;
      }
    },

    moveStart: function (e) {
      var started = Date.now();
      // self.moveStart(event);

      var that = this;
      var target = $(e.target || e.srcElement);

      var mode = (target.hasClass('left') ? 'left' : (target.hasClass('right') ? 'right' : 'left'));
      var timeout;

      var getInterval = function () {
        return 300000 / ((Date.now() - started) + 1500) + 10;
      };

      var execute = function () {
        if (mode == 'left')
          that.cx -= that.step;
        else if (mode == 'right')
          that.cx += that.step;


        that.module.controller.move(that.cx);
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
      changeX: function (value) {
        this.cx = parseFloat(value.valueOf());
      }
    }

  });

  return View;
});
