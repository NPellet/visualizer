'use strict';

define([
  'jquery',
  'lodash',
  'modules/default/defaultview',
  'src/util/util',
  'ace/ace',
  'src/util/context',
  'src/util/aceHelper'
], function ($, _, Default, Util, ace, Context, aceHelper) {
  function View() {
    this._id = Util.getNextUniqueId();
    this._code = '';
    this._data = null;
  }

  $.extend(true, View.prototype, Default, {
    init() {
      var table = this.table = $('<table>').css({
        height: '100%',
        width: '100%'
      });
      var editorRow = $('<tr>').appendTo(table).css('height', 'auto');
      this.buttonRow = $('<tr>').appendTo(table).css('height', '30px');
      this.editorCell = $('<td>').css('height', '100%').appendTo(editorRow);
      this.buttonCell = $('<td>').appendTo(this.buttonRow).css('text-align', 'center');

      var debouncing = this.module.getConfiguration('debouncing');
      if (debouncing > 0) {
        this.editorChangedDebounced = _.debounce(this.editorChanged.bind(this, false), debouncing);
      } else if (debouncing === -1) {
        this.editorChangedDebounced = this.editorChanged.bind(this, true);
      } else {
        this.editorChangedDebounced = this.editorChanged.bind(this, false);
      }

      this.module.getDomContent().html(table);
    },
    inDom() {
      var initVal = String(this.module.getConfiguration('script') || '');
      this.setCode(initVal, false, true);

      if (this.module.getConfigurationCheckbox('iseditable', 'editable')) {
        this.editable = true;
        $(`<div id="${this._id}"></div>`).css('height', '100%').css('width', '100%').appendTo(this.editorCell);
        this.editor = ace.edit(this._id);
        var mode = `./mode/${this.module.getConfiguration('mode')}`;

        aceHelper.applyConfig(this.module, this.editor);
        this.editor.$blockScrolling = Infinity;
        this.editor.getSession().setOption('useWorker', false);
        this.editor.getSession().setMode(mode);
        this.editor.setValue(initVal, -1);
        this.editor.getSession().on('change', this.editorChangedDebounced);
      }

      if (this.module.getConfigurationCheckbox('hasButton', 'button')) {
        this.buttonCell.append(
          $(`<button>${this.module.getConfiguration('btnvalue')}</button>`)
            .addClass('form-button')
            .on('click', () => this.module.controller.onButtonClick(this.getCode()))
        );
      } else {
        this.buttonRow.remove();
      }
      this.resolveReady();
    },
    blank: {
      data() {
        this._data = null;
        this.setCode('', false, true);
        if (this.editable) {
          this.editor.setValue('');
        }
      }
    },
    update: {
      data(value) {
        this._data = value;
        var val = String(value.get());
        this.setCode(val, false, true);
        if (this.editable) {
          var currentVal = this.editor.getValue();
          if (val === currentVal) {
            return;
          }
          this.editor.setValue(val);
          this.editor.scrollToLine(0);
          this.editor.clearSelection();
        }
      }
    },
    editorChanged(noTrigger) {
      this.setCode(this.editor.getValue(), noTrigger, false);
    },
    onResize() {
      if (this.editor) {
        this.editor.resize();
      }
    },
    setCode(value, noTrigger, preventInputChange) {
      var currentValue = this._code;
      if (currentValue === value) {
        return;
      }
      this._code = value;
      if (this.module.getConfigurationCheckbox('storeOnChange', 'store') && this.module.definition.configuration.groups) {
        this.module.definition.configuration.groups.group[0].script[0] = value;
      }
      if (!noTrigger) {
        this.module.controller.onEditorChanged(value, preventInputChange);
      }
    },
    getCode() {
      return this._code;
    }
  });

  return View;
});
