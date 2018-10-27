'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'src/util/util',
  'quill',
  'quillImageResizeModule',
  'lodash',
  'src/main/grid',
  'quillImageDropModule'
], function ($, Default, Util, Quill, ImageResize, _, Grid) {
  Quill.register('modules/ImageResize', ImageResize.default);
  function View() {
    this._id = Util.getNextUniqueId();
  }

  $.extend(true, View.prototype, Default, {
    init: function () {
      var that = this;
      this.debounce = this.module.getConfiguration('debouncing');
      this.storeInView = this.module.getConfigurationCheckbox(
        'storeInView',
        'yes'
      );
      this.valueChanged = _.debounce(function () {
        that.module.controller.valueChanged.apply(
          that.module.controller,
          arguments
        );
      }, this.debounce);
    },
    inDom: function () {
      this.initEditor();
    },
    initEditor: function () {
      Util.loadCss('./components/quill/quill.core.css')
        .then(() => {
          return Util.loadCss('./components/quill/quill.snow.css');
        })
        .then(() => {
          return Util.loadCss('node_modules/katex/dist/katex.min.css');
        })
        .then(() => {
          var contents = this.module.definition.richtext || '';
          this.$content = $(`<div id="${this._id}" class="quill_editor" />`);

          this.dom = $('<div class="quill_wrapper" />');
          this.$content.appendTo(this.dom);

          this.module.getDomContent().html(this.dom);

          const readOnly = !this.module.getConfigurationCheckbox(
            'editable',
            'isEditable'
          );
          this.instance = new Quill(`#${this._id}`, {
            modules: {
              clipboard: {
                matchVisual: false
              },
              imageDrop: true,
              ImageResize: {},
              formula: true,
              toolbar: readOnly
                ? false
                : getToolbar(this.module.getConfiguration('toolbarMode'))
            },
            placeholder: 'Start composing here...',
            readOnly,
            theme: 'snow' // or 'bubble'
          });

          //      this.$content.find('[data-toggle="tooltip"]').tooltip();

          if (this.storeInView) {
            this.instance.setContents(contents);
            this.module.controller.valueChanged(contents);
          }
          this.instance.on('text-change', () => {
            this.valueChanged(this.instance.getContents());
          });
          this.resolveReady();
        });
    },
    update: {
      html: function (moduleValue) {
        this.module.data = moduleValue;
        this.clear();
        this.mode = 'html';
        this.instance.clipboard.dangerouslyPasteHTML(0, moduleValue.get());
      },
      quill: function (moduleValue) {
        this.module.data = moduleValue;
        this.clear();
        this.mode = 'quill';
        this.instance.setContents(moduleValue.get());
      }
    },
    blank: {
      html: function () {
        this.clear();
      },
      quill: function () {
        this.clear();
      }
    },
    clear() {
      const len = this.instance.getLength();
      this.instance.deleteText(0, len);
    },
    onActionReceive: {
      insertHtml: function (html) {
        this.instance.focus();
        html = String(html);
        const range = this.instance.getSelection();
        this.instance.deleteText(range.index, range.length);
        this.instance.clipboard.dangerouslyPasteHTML(range.index, html);
      },
      insertText: function (text) {
        this.instance.focus();
        text = String(text);
        const range = this.instance.getSelection();
        this.instance.deleteText(range.index, range.length);
        this.instance.insertText(range.index, text);
      }
    }
  });

  function getToolbar(mode) {
    switch (mode) {
      case 'all': {
        return [
          [{ header: [1, 2, 3, 4, false] }],
          [{ font: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ color: [] }, { background: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['link', 'image', 'video', 'code-block', 'blockquote', 'code'],
          [{ align: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ direction: 'rtl' }],
          ['formula'],
          ['clean']
        ];
      }
      case 'light': {
        return [
          [{ header: [1, 2, 3, 4, false] }],
          [{ color: [] }],
          ['bold', 'italic'],
          ['link', 'image', 'blockquote'],
          [{ align: [] }],
          [{ list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }]
        ];
      }
      case 'minimal': {
        return [
          [
            { header: [1, 2, 3, 4, false] },
            { color: [] },
            'bold',
            'italic',
            { align: [] },
            { list: 'bullet' }
          ]
        ];
      }
    }
  }
  return View;
});
