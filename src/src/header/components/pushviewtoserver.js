'use strict';

define(['jquery', 'src/header/components/default', 'src/util/versioning', 'src/util/util'], function ($, Default, Versioning, Util) {
  function Element() {
  }

  Util.inherits(Element, Default, {

    initImpl: function () {
      this.viewHandler = Versioning.getViewHandler();
    },

    _onClick: function () { // Overwrite usual onclick which loads a list / loads views/datas
      var that = this;
      clearTimeout(this.timeout);
      that.$_dom.css({ color: '#000' });
      that.viewHandler.serverPush(Versioning.getView()).then(function () {
        that.$_dom.css({ color: '#357535' });
        that.returnToBlack();
      }, function () {
        that.$_dom.css({ color: '#872A2A' });
        that.returnToBlack();
      });
    },

    returnToBlack: function () {
      var that = this;
      this.timeout = setTimeout(function () {
        that.$_dom.animate({
          color: '#000'
        }, 500);
      }, 500);
    }

  });

  return Element;
});
