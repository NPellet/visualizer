'use strict';

// Inspired from node-progress
// https://github.com/tj/node-progress/blob/master/lib/node-progress.js

define([
  'modules/default/defaultview',
  'src/util/color',
  'jquery-ui/ui/widgets/progressbar',
], function (Default, Color) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      this.total = 0;
      this.curr = 0;
      this.tpl = this.module.getConfiguration('tpl', ':current / :total');

      this.progressBar = $('<div>').css({
        position: 'relative',
      });

      this.progressDiv = $('<div>').css({
        position: 'absolute',
        left: '50%',
        top: '4px',
        fontWeight: 'bold',
      });
      this.progressBar.append(this.progressDiv);

      this.progressBar.progressbar({
        value: 0,
      });

      this.progressBar.find('.ui-progressbar-value').css({
        background: Color.getColor(this.module.getConfiguration('barcolor')),
      });

      this.module.getDomContent().html(this.progressBar);
      this.resolveReady();
    },

    blank: {
      total() {
        this.total = 0;
        this.curr = 0;
        this.render();
      },
    },

    update: {
      total(total) {
        this.total = total.get();
        this.start = Date.now();
        this.render();
      },
    },

    onActionReceive: {
      inc(value) {
        if (value !== 0) {
          value = value || 1;
        }
        this.curr += +value;
        this.render();
      },
      set(value) {
        this.onActionReceive.inc.call(this, +value - this.curr);
      },
      total(value) {
        this.total = +value;
        this.render();
      },
    },

    render() {
      var ratio = this.curr / this.total;
      ratio = Math.min(Math.max(ratio, 0), 1);

      var percent = ratio * 100;

      if (this.curr === 0) {
        this.start = Date.now();
      }

      var elapsed = Date.now() - this.start;
      var eta = percent === 100 ? 0 : elapsed * (this.total / this.curr - 1);

      var str = this.tpl
        .replace(':current', this.curr)
        .replace(':total', this.total)
        .replace(
          ':elapsed',
          isNaN(elapsed) ? '0.0' : (elapsed / 1000).toFixed(1),
        )
        .replace(
          ':eta',
          isNaN(eta) || !isFinite(eta) ? '0.0' : (eta / 1000).toFixed(1),
        )
        .replace(':percent', `${percent.toFixed(1)}%`);

      this.progressBar.progressbar('value', percent);
      this.progressDiv.text(str);
    },
  });

  return View;
});
