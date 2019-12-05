'use strict';

define(['src/util/util', 'src/util/api'], function (Util, API) {
  return {
    initDefault() {
      this.onReady = true;
    },

    init() {
      this.resolveReady();
    },

    setModule(module) {
      this.module = module;
    },

    update: {},

    blank: {},

    onResize: Util.noop,

    onActionReceive: {
      _editPreferences(values) {
        API.updateModulePreferences(this.module.definition.id, values);
      },
      _print(values) {
        this.module.printView(values);
      }
    },

    inDom: Util.noop,

    resolveReady() {
      this.module._resolveView();
    },

    startLoading(rel) {
      this.loadingElements = this.loadingElements || [];
      if (
        this.relsForLoading().indexOf(rel) > -1 &&
                this.loadingElements.indexOf(rel) == -1
      ) {
        this.loadingElements.push(rel);
        this.showLoading();
      }
    },

    endLoading(rel) {
      this.loadingElements = this.loadingElements || [];
      if (
        this.relsForLoading().indexOf(rel) > -1 &&
                this.loadingElements.indexOf(rel) > -1
      ) {
        this.loadingElements.splice(
          this.loadingElements.indexOf(rel),
          1
        );
        if (this.loadingElements.length == 0) {
          this.hideLoading();
        }
      }
    },

    showLoading(customText = 'Loading ...') {
      this.module.domLoading.text(customText);
      this.module.domLoading.addClass('ci-module-loading-visible');
    },

    hideLoading() {
      this.module.domLoading.removeClass('ci-module-loading-visible');
    },

    relsForLoading() {
      return this._relsForLoading || (this._relsForLoading = []);
    },

    // TODO hack for chrome
    // see http://jsfiddle.net/jub3ohct/3/
    refresh() {
      const el = this.module.getDomContent();
      el.hide();
      setImmediate(function () {
        el.show();
      });
    }
  };
});
