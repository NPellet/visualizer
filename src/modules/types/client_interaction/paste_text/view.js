'use strict';

define(['modules/default/defaultview', 'src/util/ui'], function (Default, ui) {
  function View() {
    this.currentValue = '';
  }

  $.extend(true, View.prototype, Default, {
    inDom: function () {
      var that = this;
      var defaultValue = this.module.getConfiguration('thevalue');
      var textarea = ui.getSafeElement('textarea').on('keyup', function () {
        var val = textarea.val();
        if (that.currentValue !== val) {
          that.module.controller.valueChanged(val);
          that.currentValue = val;
        }
      }).val(defaultValue);
      this.module.getDomContent().html(textarea);
      this.currentValue = defaultValue;
      this.module.controller.valueChanged(defaultValue);
      this.resolveReady();
    }
  });

  return View;
});
