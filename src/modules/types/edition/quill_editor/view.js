'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'src/util/util',
  'src/util/api',
  'quill',
  'quillImageResizeModule',
  'lodash',
], function ($, Default, Util, API, Quill, ImageResize, _) {
  Quill.register('modules/imageResize', ImageResize);
  function View() {
    this._id = Util.getNextUniqueId();
  }
  if (!Quill.imports['formats/link'].PROTOCOL_WHITELIST.includes('blob')) {
    Quill.imports['formats/link'].PROTOCOL_WHITELIST.push('blob');
  }

  $.extend(true, View.prototype, Default, {
    init() {
      this.debounce = this.module.getConfiguration('debouncing');
      this.storeInView = this.module.getConfigurationCheckbox(
        'storeInView',
        'yes',
      );
      this.module.currentWord = ''; // used for shortcut expansion
      this.module.shortcuts = [];
      this.valueChanged = _.debounce(() => {
        this.module.controller.valueChanged.apply(
          this.module.controller,
          arguments,
        );
      }, this.debounce);
    },
    inDom() {
      this.initEditor();
    },
    initEditor() {
      Util.loadCss('./node_modules/quill/dist/quill.core.css')
        .then(() => {
          return Util.loadCss('./node_modules/quill/dist/quill.snow.css');
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
              clipboard: {},
              imageResize: {},
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
    exportToHTML() {
      const dom = this.dom[0].querySelector('.ql-editor');
      API.domToHTML(dom).then((html) => {
        API.copyHTMLToClipboard(html);
      });
    },
    update: {
      html(moduleValue) {
        this.module.data = moduleValue;
        this.clear();
        this.mode = 'html';
        this.instance.setContents(
          this.instance.clipboard.convert({ html: moduleValue.get() }),
        );
      },
      quill(moduleValue) {
        this.module.data = moduleValue;
        this.clear();
        this.mode = 'quill';
        this.instance.setContents(moduleValue.get());
      },
      shortcuts(value) {
        if (!value || value.length === 0) {
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
      html() {
        this.clear();
      },
      quill() {
        this.clear();
      },
      shortcuts() {
        this.module.shortcuts = [];
      },
    },
    clear() {
      const len = this.instance.getLength();
      this.instance.deleteText(0, len);
    },
    onActionReceive: {
      insertHtml(html) {
        this.instance.focus();
        html = String(html);
        const range = this.instance.getSelection();
        this.instance.deleteText(range.index, range.length);
        this.instance.clipboard.dangerouslyPasteHTML(range.index, html);
      },
      insertText(text) {
        this.instance.focus();
        text = String(text);
        const range = this.instance.getSelection();
        this.instance.deleteText(range.index, range.length);

        let div = document.createElement('div');
        div.append(document.createTextNode(text));
        this.instance.clipboard.dangerouslyPasteHTML(
          range.index,
          div.innerHTML,
        );
      },
    },
    _listenForShortcuts(event) {
      if (!this.module.shortcuts || this.module.shortcuts.length === 0) return;
      if (
        event.key !== '_' &&
        (event.key < 'A' || event.key > 'Z') &&
        (event.key < 'a' || event.key > 'z') &&
        (event.key < '0' || event.key > '9')
      ) {
        let matching = this.module.shortcuts.find(
          (entry) => entry.key === this.module.currentWord,
        );
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
