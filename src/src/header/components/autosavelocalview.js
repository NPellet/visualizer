'use strict';

define([
  'jquery',
  'src/header/components/default',
  'src/util/versioning',
  'src/util/util'
], function ($, Default, Versioning, Util) {
  function Element() {}

  Util.inherits(Element, Default, {
    initImpl: function () {
      this.viewHandler = Versioning.getViewHandler();
    },

    _onClick: function () {
      // Overwrite usual onclick which loads a list / loads views/datas
      if (this._open) {
        this.open();
      } else {
        this.close();
      }
    },

    open: function () {
      var that = this;
      this.interval = window.setInterval(function () {
        var view = Versioning.getView();

        if (that.viewHandler.currentPath[3] !== 'head')
          that.viewHandler.serverCopy(view);

        that.viewHandler._localSave(view, 'head', view._name);
        that.$_dom.css({ color: '#BCF2BB' });
        /* }
                 else // We're not on the HEAD ! Therefore we cannot autosave (revert needed first)
                 that.$_dom.css({ color: '#E0B1B1' });
                 */
      }, 1000);

      this.$_dom.addClass('toggledOn');
    },

    close: function () {
      window.clearTimeout(this.interval);
      this.$_dom.css({ color: '' });
      this.$_dom.removeClass('toggledOn');
    }
  });

  return Element;
});
