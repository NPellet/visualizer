'use strict';

define(['modules/default/defaultview', 'src/util/ui'], function (Default, ui) {
  function View() {
    this.currentValue = '';
  }

  $.extend(true, View.prototype, Default, {
    inDom: function () {
      let that = this;
      let defaultValue = this.module.getConfiguration('thevalue');
      var textarea = ui.getSafeElement('textarea').on('keyup', function () {
        let val = textarea.val();
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
