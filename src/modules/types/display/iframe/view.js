'use strict';

define(['modules/default/defaultview'], function (Default) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {
    init: function () {
      this.dom = $('<iframe>');

      var that = this;
      this.dom.load(function () { // we remove the loading message
        if (that.dom.attr('src') != 'about:blank') {
          if (that._loadingTimeout) clearTimeout(that._loadingTimeout);
          else that.hideLoading();
        }
      });

      this.module.getDomContent().html(this.dom);
      this.resolveReady();
    },
    blank: {
      url: function () {
        this.dom.attr('src', 'about:blank');
      }
    },
    update: {
      url: function (moduleValue) {
        var that = this;
        if (that._loadingTimeout) clearTimeout(that._loadingTimeout);
        this._loadingTimeout = setTimeout(function () {
          that._loadingTimeout = null;
          that.showLoading();
        }, 500);
        this.dom.attr('src', String(moduleValue.get()));
      }
    }
  });

  return View;
});
