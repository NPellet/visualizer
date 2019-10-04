'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'ace/ace',
  'src/util/context',
  'jquery',
  'forms/button'
], function (Default, Util, ace, Context, $, Button) {
  function View() {}

  $.extend(true, View.prototype, Default);

  View.prototype.init = function () {
    this._id = Util.getNextUniqueId();
    this._code = '';

    var table = (this.table = $('<table>').css({
      height: '100%',
      width: '100%',
      bottom: 0
    }));
    var editorRow = $('<tr>')
      .appendTo(table)
      .css('height', 'auto');
    this.editorRow = editorRow;
    this.buttonRow = $('<tr>')
      .appendTo(table)
      .css('height', '30px');
    this.editorCell = $('<td>')
      .css('height', '100%')
      .appendTo(editorRow);
    this.buttonCell = $('<td>')
      .appendTo(this.buttonRow)
      .css('text-align', 'center');
    this._input = {};
    this.buttons = [];
    this.module.getDomContent().html(table);
  };

  View.prototype.inDom = function () {
    var that = this;

    var initVal = this.module.getConfiguration('script') || '';
    this._code = initVal;

    if (this.module.getConfigurationCheckbox('display', 'editor')) {
      $(`<div id="${this._id}"></div>`)
        .css('height', '100%')
        .css('width', '100%')
        .appendTo(this.editorCell);
      this.editor = ace.edit(this._id);
      this.editor.$blockScrolling = Infinity;
      this.editor.getSession().setOption('useWorker', false);
      this.editor.getSession().setMode('./mode/javascript');
      this.editor.setValue(initVal, -1);
      this.editor.getSession().on('change', this.editorChanged.bind(this));
      this.table.css({ height: '100%' });
    } else {
      this.table.css({ height: 'auto' });
    }

    if (this.module.getConfigurationCheckbox('display', 'buttons')) {
      var buttons = this.module.getConfiguration('buttons');
      if (buttons) {
        buttons.forEach(function (button, idx) {
          var onclick = that.module.controller.onButtonClick.bind(
            that.module.controller,
            button.name
          );
          var b = new Button(button.label, onclick, {
            color: 'Grey',
            disabled: false
          });
          b.name = button.name;
          if (button.hide && button.hide.indexOf('hide') > -1) {
            b.hide();
          }
          if (button.disable && button.disable.indexOf('disable') > -1) {
            b.disable();
          }
          that.buttonCell.append(b.render());
          that.buttons.push(b);
          if (idx === 0 && that.editor) {
            that.editor.commands.addCommand({
              name: 'run',
              bindKey: { win: 'Ctrl-Return', mac: 'Command-Return' },
              exec: onclick
            });
          }
        });
      } else {
        this.buttonRow.css('height', 0);
      }
    } else {
      this.buttonRow.css('height', 0);
    }

    this.resolveReady();
  };

  View.prototype.disableButtons = function () {
    this.buttons.forEach((b) => b.disable());
  };

  View.prototype.enableButtons = function () {
    this.buttons.forEach((b) => {
      if (!b.disabledFromScript) b.enable();
    });
  };

  View.prototype.onResize = function () {
    if (this.editor) {
      if (this.height - this.buttonRow.height() < 30) {
        this.editorCell.hide();
      } else {
        this.editorCell.show();
        this.editor.resize();
      }
    }
  };

  View.prototype.editorChanged = function () {
    var val = this.editor.getValue();
    this._code = val;
    this.module.definition.configuration.groups.group[0].script[0] = val;
  };

  View.prototype.blank.inputValue = function (name) {
    this._input[name] = null;
  };

  View.prototype.update.inputValue = function (value, name) {
    this._input[name] = value;
    this.module.controller.onVariableIn(name);
  };

  View.prototype.onActionReceive.execute = function (value, name) {
    this.module.controller.onActionIn(name, value);
  };

  return View;
});
