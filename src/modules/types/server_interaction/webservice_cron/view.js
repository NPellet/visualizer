'use strict';

define(['modules/default/defaultview'], function (Default) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {
    init: function () {
      this.dom = $('<div></div>');
      this.logList = this.dom[0].children;
      this.module.getDomContent().html(this.dom);
      this.module.controller.start();
      this.maxLogs = this.module.getConfiguration('maxLogs');
      this.resolveReady();
    },
    log: function (success, variable) {
      var time = new Date();
      var color = success ? '#77DD77' : '#FF6961';
      this.dom.prepend(`<div>[${time.toLocaleString()}] - ${success ? 'Ok' : 'Error'}; Variable: ${variable}</div>`);
      this.dom.find(':first-child').css('background-color', color);

      if (this.logList.length > this.maxLogs) {
        this.logList[this.logList.length - 1].remove();
      }
    }
  });

  return View;
});
