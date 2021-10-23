'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'src/util/util',
  'quill',
  'quillImageResizeModule',
  'lodash',
  'src/main/grid',
  'quillImageDropModule',
], function ($, Default, Util, Quill, ImageResize, _, Grid) {
  Quill.register('modules/ImageResize', ImageResize.default);
  function View() {
    this._id = Util.getNextUniqueId();
  }
  if (!Quill.imports['formats/link'].PROTOCOL_WHITELIST.includes('blob')) {
    Quill.imports['formats/link'].PROTOCOL_WHITELIST.push('blob');
  }

  $.extend(true, View.prototype, Default, {
    init: function () {
      var that = this;
      this.debounce = this.module.getConfiguration('debouncing');
      this.storeInView = this.module.getConfigurationCheckbox(
        'storeInView',
        'yes',
      );
      this.module.currentWord = ''; // used for shortcut expansion
      this.module.shortcuts = [];
      this.valueChanged = _.debounce(function () {
        that.module.controller.valueChanged.apply(
          that.module.controller,
          arguments,
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
          this.$content = $(`
            <style>
              ${this.module.getConfiguration('css')}
            </style>
            <div id="${
  this._id
}" class="quill_editor ${this.module.getConfiguration(
  'className',
)}" />
          `);

          this.dom = $('<div class="quill_wrapper" />');
          this.dom.bind('keypress', (event) => this._listenForShortcuts(event));
          this.dom.bind('keydown', (event) => {
            if (event.key === 'Shift') return;
            if (event.key === 'Tab') {
              this._listenForShortcuts({ key: '', isTab: true });
              return;
            }
            if (event.key.length > 1) {
              this.module.currentWord = '';
            }
          });
          this.$content.appendTo(this.dom);

          this.module.getDomContent().html(this.dom);

          const readOnly = !this.module.getConfigurationCheckbox(
            'editable',
            'isEditable',
          );
          this.instance = new Quill(`#${this._id}`, {
            modules: {
              clipboard: {
                matchVisual: false,
              },
              imageDrop: true,
              ImageResize: {},
              formula: true,
              toolbar: readOnly
                ? false
                : getToolbar(this.module.getConfiguration('toolbarMode')),
            },
            placeholder: 'Start composing here...',
            readOnly,
            theme: 'snow', // or 'bubble'
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
        this.instance.setContents(
          this.instance.clipboard.convert(moduleValue.get()),
        );
      },
      quill: function (moduleValue) {
        this.module.data = moduleValue;
        this.clear();
        this.mode = 'quill';
        this.instance.setContents(moduleValue.get());
      },
      shortcuts: function (value) {
        if (!value || value.length < 1) {
          this.module.shortcuts = [];
        }
        value = JSON.parse(JSON.stringify(value));
        if (!Array.isArray(value)) return;
        this.module.shortcuts = value.filter(
          (entry) => entry.key && (entry.html || entry.text),
        );
      },
    },
    blank: {
      html: function () {
        this.clear();
      },
      quill: function () {
        this.clear();
      },
      shortcuts: function () {
        this.module.shortcuts = [];
      },
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

        let div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        this.instance.clipboard.dangerouslyPasteHTML(
          range.index,
          div.innerHTML,
        );
      },
    },
    _listenForShortcuts: function (event) {
      if (!this.module.shortcuts || this.module.shortcuts.length < 1) return;
      if (
        event.key !== '_' &&
        (event.key < 'A' || event.key > 'Z') &&
        (event.key < 'a' || event.key > 'z') &&
        (event.key < '0' || event.key > '9')
      ) {
        let matching = this.module.shortcuts.filter(
          (entry) => entry.key === this.module.currentWord,
        )[0];
        this.module.currentWord = '';
        if (!matching) return;
        let selection = this.instance.getSelection();
        let keyLength = matching.key.length + (event.isTab || 0);
        let insertPosition = selection.index - keyLength;
        this.instance.deleteText(insertPosition, keyLength);
        if (matching.text) {
          this.instance.insertText(insertPosition, matching.text);
        } else if (matching.html) {
          this.instance.clipboard.dangerouslyPasteHTML(
            insertPosition,
            matching.html,
          );
          this.instance.setSelection(this.instance.getSelection().index + 1, 0);
        }
      } else {
        this.module.currentWord += event.key;
      }
    },
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
          ['clean'],
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
          [{ script: 'sub' }, { script: 'super' }],
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
            { list: 'bullet' },
          ],
        ];
      }
    }
  }
  return View;
});
