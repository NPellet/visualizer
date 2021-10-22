'use strict';

define([
  'modules/default/defaultview',
  'modules/types/edition/onde/view',
  'modules/types/display/template-twig/view'
], function (Default, OndeV, TwigV) {
  function View() {
    this.twigV = new TwigV();
    this.ondeV = new OndeV();
  }

  $.extend(true, View.prototype, Default, {
    setModule: function (module) {
      this.module = module;

      this.twigV.module = $.extend({}, module);
      this.twigV.module.view = this.twigV;
      module.twigM = this.twigV.module;

      this.ondeV.module = $.extend({}, module);
      this.ondeV.module.view = this.ondeV;
      module.ondeM = this.ondeV.module;

      let that = this;
      let configCustom = function () {
        return that.module.getConfiguration.apply(that.module, arguments);
      };
      this.twigV.module.getConfiguration = configCustom;
      this.ondeV.module.getConfiguration = configCustom;
    },
    init: function () {
      let html = '<div></div>';

      this.dom = $(html).css({
        height: '100%',
        width: '100%'
      });

      this.twigV.init();
      this.ondeV.init();

      let that = this;

      let exportForm = this.ondeV.exportForm;
      this.ondeV.exportForm = function () {
        exportForm.apply(this);
        that.loadTwig();
      };
      this.ondeV.initForm();
    },
    blank: {},
    inDom: function () {
      this.module.getDomContent().html(this.dom);
      this.loadTwig();
      this.resolveready();
    },
    update: {
      value: function (val, name) {
        this._value = [val, name];
        this.twigV.update.value.apply(this.twigV, arguments);
        this.ondeV.update.inputValue.apply(this.ondeV, arguments);
      }
    },
    loadOnde: function () {
      this.dom.html(this.ondeV.dom);
    },
    loadTwig: function () {
      let that = this;
      this.dom.html(this.twigV.dom);
      this.twigV.dom.dblclick(function () {
        that.loadOnde();
      });
      if (this._value) this.twigV.update.value.apply(this.twigV, this._value);
      this.twigV.render();
    }
  });

  return View;
});
