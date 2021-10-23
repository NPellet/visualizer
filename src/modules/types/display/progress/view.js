'use strict';

// Inspired from node-progress
// https://github.com/tj/node-progress/blob/master/lib/node-progress.js

define([
  'modules/default/defaultview',
  'src/util/color',
  'jquery-ui/ui/widgets/progressbar'
], function (Default, Color) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      this.total = 0;
      this.curr = 0;
      this.tpl = this.module.getConfiguration('tpl', ':current / :total');

      var progressBar = this.progressBar = $('<div>').css({
        position: 'relative'
      });

      var progressDiv = this.progressDiv = $('<div>').css({
        position: 'absolute',
        left: '50%',
        top: '4px',
        fontWeight: 'bold'
      });
      progressBar.append(progressDiv);

      progressBar.progressbar({
        value: 0
      });

      progressBar.find('.ui-progressbar-value').css({
        background: Color.getColor(this.module.getConfiguration('barcolor'))
      });

      this.module.getDomContent().html(progressBar);
      this.resolveReady();
    },

    blank: {
      total: function () {
        this.total = 0;
        this.curr = 0;
        this.render();
      }
    },

    update: {
      total: function (total) {
        this.total = total.get();
        this.start = Date.now();
        this.render();
      }
    },

    onActionReceive: {
      inc: function (value) {
        if (value !== 0) {
          value = value || 1;
        }
        this.curr += +value;
        this.render();
      },
      set: function (value) {
        this.onActionReceive.inc.call(this, +value - this.curr);
      },
      total: function (value) {
        this.total = +value;
        this.render();
      }
    },

    render: function () {
      var ratio = this.curr / this.total;
      ratio = Math.min(Math.max(ratio, 0), 1);

      var percent = ratio * 100;

      if (this.curr === 0)
        this.start = Date.now();

      var elapsed = Date.now() - this.start;
      var eta = (percent == 100) ? 0 : elapsed * (this.total / this.curr - 1);

      var str = this.tpl
        .replace(':current', this.curr)
        .replace(':total', this.total)
        .replace(':elapsed', isNaN(elapsed) ? '0.0' : (elapsed / 1000).toFixed(1))
        .replace(':eta', (isNaN(eta) || !isFinite(eta)) ? '0.0' : (eta / 1000).toFixed(1))
        .replace(':percent', `${percent.toFixed(1)}%`);

      this.progressBar.progressbar('value', percent);
      this.progressDiv.text(str);
    }
  });

  return View;
});
