'use strict';

define(['jquery', 'modules/default/defaultview', 'forms/form'], function ($, Default, Form) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {
    init: function () {
      this.dom = $('<div />');
      this.module.getDomContent().html(this.dom);
      this.callback = null;
    },

    inDom: function () {
      var that = this;
      var structure = this.module.getConfiguration('structure');
      var tpl_file = this.module.getConfiguration('tpl_file');
      var tpl_html = this.module.getConfiguration('tpl_html');

      var json;
      try {
        json = JSON.parse(structure);
      } catch (e) {
        return;
      }

      if (this.module.getConfigurationCheckbox('options', 'defaultTpl')) {
        var form = new Form({});
        form.init({ onValueChanged: that.onChange.bind(that) });
        form.setStructure(json);
        form.onStructureLoaded().done(function () {
          form.fill();
        });
        form.onLoaded().done(function () {
          that.dom.html(form.makeDom(1));
          form.inDom();
        });

        return;
      }

      var def;
      if (tpl_file) {
        def = $.get(tpl_file, {});
      } else {
        def = tpl_html;
      }

      $.when(def).done(function (tpl) {
        var form = new Form({});
        form.init({ onValueChanged: that.onChange.bind(that) });

        form.setStructure(json);
        form.onStructureLoaded().done(function () {
          form.fill({}); // For now let's keep it empty.
        });

        form.onLoaded().done(function () {
          form.setTpl(tpl);
          that.dom.html(form.makeDomTpl());
          form.inDom();
          that.resolveReady();
        });
      });
    },
    onChange: function (fieldElement, data) {
      this.module.controller.dataChanged(data);
    }
  });

  return View;
});
