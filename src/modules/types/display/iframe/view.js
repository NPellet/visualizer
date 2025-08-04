'use strict';

define(['modules/default/defaultview'], function (Default) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      this.dom = $('<iframe>');

      this.dom.on('load', () => {
        // we remove the loading message
        if (this.dom.attr('src') !== 'about:blank') {
          if (this._loadingTimeout) clearTimeout(this._loadingTimeout);
          else this.hideLoading();
        }
      });

      this.module.getDomContent().html(this.dom);
      this.resolveReady();
    },
    blank: {
      url() {
        this.dom.attr('src', 'about:blank');
      },
    },
    update: {
      url(moduleValue) {
        if (this._loadingTimeout) clearTimeout(this._loadingTimeout);
        this._loadingTimeout = setTimeout(() => {
          this._loadingTimeout = null;
          this.showLoading();
        }, 500);
        this.dom.attr('src', String(moduleValue.get()));
      },
    },
  });

  return View;
});
