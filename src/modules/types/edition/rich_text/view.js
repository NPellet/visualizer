'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'src/util/util',
  'ckeditor',
  'lodash',
  'src/main/grid',
  'chroma'
], function ($, Default, Util, CKEDITOR, _, Grid, chroma) {
  function View() {
    this._id = Util.getNextUniqueId();
  }

  $.extend(true, View.prototype, Default, {
    init: function () {
      var that = this;
      this.plainHtml = this.module.getConfigurationCheckbox('plainHtml', 'yes');
      this.debounce = this.module.getConfiguration('debouncing');
      this.storeInView = this.module.getConfigurationCheckbox('storeInView', 'yes');
      this.valueChanged = _.debounce(function () {
        that.module.controller.valueChanged.apply(that.module.controller, arguments);
      }, this.debounce);
    },
    inDom: function () {
      this.initEditor();
    },
    blank: {
      html: function () {
        this.updateEditor('');
      }
    },
    update: {
      html: function (moduleValue) {
        this.module.data = moduleValue;
        var val = moduleValue.get();
        if (this.storeInView) {
          this.module.definition.richtext = val;
        }
        this.updateEditor(val);
      }
    },
    initEditor: function () {
      var that = this;
      var initText = this.module.definition.richtext || '';
      this.readOnly = !this.module.getConfigurationCheckbox('editable', 'isEditable');
      if (this.readOnly && this.plainHtml) {
        this.dom = $('<div>');
        if (this.storeInView) {
          this.dom.html(initText);
        }
        this.module.getDomContent().html(this.dom);
        this._setCss();
      } else {
        this.dom = $(`<div id="${this._id}" contenteditable="true">`);
        if (this.storeInView) {
          this.dom.html(initText);
          this.module.controller.valueChanged(initText);
        }
        this.module.getDomContent().html(this.dom);
        this._setCss();
        if (CKEDITOR.instances[this._id]) {
          CKEDITOR.instances[this._id].destroy();
        }
        CKEDITOR.disableAutoInline = true;
        var options = {
          extraPlugins: 'mathjax,font,sourcedialog,codesnippet',
          removeButtons: '',
          language: 'en',
          mathJaxLib: '//cdn.mathjax.org/mathjax/2.2-latest/MathJax.js?config=TeX-AMS_HTML'
        };
        if (this.readOnly) {
          options.readOnly = true;
          options.removePlugins = 'toolbar';
          options.allowedContent = true;
        }
        this.instance = CKEDITOR.inline(this._id, options);

        this.instance.on('change', function () {
          that.valueChanged(that.instance.getData());
          if (that.module.getConfigurationCheckbox('autoHeight', 'yes')) {
            that.module.getDomWrapper().height(that.getContentHeight() + 50);
            Grid.moduleResize(that.module);
          }
        });
        this.instance.on('loaded', function () {
          that.resolveReady();
        });
      }
    },
    updateEditor: function (html) {
      html = String(html);
      if (this.plainHtml) {
        this.dom.html(html);
      } else {
        this.instance.setData(html);
      }
    },
    getContentHeight: function () {
      var height = 0;
      this.dom.children().each(function () {
        height += $(this).height();
      });
      return height;
    },

    onActionReceive: {
      insertHtml: function (html) {
        this.instance.insertHtml(html, 'unfiltered_html');
      },
      insertText: function (text) {
        setImmediate(() => {
          this.instance.insertText(text);
        });
      }
    },

    _setCss: function () {
      var bgColor = this.module.getConfiguration('bgColor');
      this.dom.css({
        height: '100%',
        width: '100%',
        padding: '5px',
        boxSizing: 'border-box'
      });
      if (this.module.getConfigurationCheckbox('postit', 'yes')) {
        var ch = chroma(bgColor[0], bgColor[1], bgColor[2]);
        this.dom.addClass('richtext-postit');
        this.dom.parents('.ci-module-wrapper').addClass('ci-module-richtext-postit');
        this.dom.css({
          background: `${Util.getCssVendorPrefix()}radial-gradient(center, ellipse cover, ${ch.brighter().hex()} 0%, ${ch.hex()} 100%)`
          // background: 'radial-gradient(ellipse at center, ' + ch.brighter().hex() + ' 0%,' + ch.hex() + ' 100%)',
        });
      } else {
        this.dom.css({
          background: ''
        });
        this.dom.css({
          'background-color': `rgba(${bgColor.join(',')})`
        });
        this.dom.removeClass('richtext-postit');
        this.dom.parents('.ci-module-wrapper').removeClass('ci-module-richtext-postit');
      }
    }
  });

  return View;
});
