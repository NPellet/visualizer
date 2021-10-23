'use strict';

define(['modules/types/client_interaction/code_editor/view', 'src/util/util', 'ace/ace', 'src/util/context', 'jquery'], function (CodeEditor, Util, ace, Context, $) {
  function View() {
    CodeEditor.call(this);
  }

  Util.inherits(View, CodeEditor);

  View.prototype.inDom = function () {
    var that = this;

    this.editable = true;
    $(`<div id="${this._id}"></div>`).css('height', '100%').css('width', '100%').appendTo(this.editorCell);
    this.editor = ace.edit(this._id);
    var initVal = this.module.getConfiguration('script') || '';
    this._code = initVal;
    this.editor.$blockScrolling = Infinity;
    this.editor.getSession().setOption('useWorker', false);
    this.editor.getSession().setMode('./mode/javascript');
    this.editor.setValue(initVal, -1);
    this.editor.getSession().on('change', function () {
      that.editorChanged();
    });

    this.buttonCell.append(
      $('<span>Execute filter</span>')
        .addClass('form-button')
        .on('click', function () {
          that.module.controller.onButtonClick(that._code, that._object);
        })
    );

    this.table.prepend($('<tr><td>function(value, resolve, reject) {</td></tr>').css('height', '10px'));
    $('<tr><td>}</td></tr>').css('height', '10px').insertBefore(this.buttonRow);

    this.resolveReady();
  };

  View.prototype.editorChanged = function () {
    var val = this.editor.getValue();
    this._code = val;
    this.module.definition.configuration.groups.group[0].script[0] = val;
  };

  View.prototype.blank.dataobject = function () {
    this._object = null;
  };

  View.prototype.update.dataobject = function (value) {
    this._object = value;
    this.module.controller.onButtonClick(this._code, this._object);
  };

  View.prototype.onActionReceive.doFilter = function () {
    this.module.controller.onButtonClick(this._code, this._object);
  };

  return View;
});
