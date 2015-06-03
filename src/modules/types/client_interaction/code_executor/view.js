'use strict';

define(['modules/default/defaultview', 'src/util/util', 'ace/ace', 'src/util/context', 'jquery'], function (Default, Util, ace, Context, $) {

    function View() {
    }

    $.extend(true, View.prototype, Default);

    View.prototype.init = function () {
        this._id = Util.getNextUniqueId();
        this._code = '';

        var table = this.table = $('<table>').css({
            height: '100%',
            width: '100%'
        });
        var editorRow = $('<tr>').appendTo(table).css('height', 'auto');
        this.buttonRow = $('<tr>').appendTo(table).css('height', '30px');
        this.editorCell = $('<td>').css('height', '100%').appendTo(editorRow);
        this.buttonCell = $('<td>').appendTo(this.buttonRow).css('text-align', 'center');
        this._input = {};
        this.module.getDomContent().html(table);
    };

    View.prototype.inDom = function () {
        var self = this;

        var initVal = this.module.getConfiguration('script') || '';
        this._code = initVal;

        if (this.module.getConfigurationCheckbox('display', 'editor')) {
            $('<div id="' + this._id + '"></div>').css('height', '100%').css('width', '100%').appendTo(this.editorCell);
            this.editor = ace.edit(this._id);
            this.editor.$blockScrolling = Infinity;
            this.editor.getSession().setMode('./mode/javascript');
            this.editor.setValue(initVal, -1);
            this.editor.getSession().on('change', this.editorChanged.bind(this));
        }

        if (this.module.getConfigurationCheckbox('display', 'buttons')) {
            var buttons = this.module.getConfiguration('buttons');
            if (buttons) {
                buttons.forEach(function (button) {
                    self.buttonCell.append(
                        $('<span>' + button.label + '</span>')
                            .addClass('form-button')
                            .on('click', function () {
                                self.module.controller.onButtonClick(button.name);
                            })
                    );
                });
            } else {
                this.buttonRow.css('height', 0);
            }
        } else {
            this.buttonRow.css('height', 0);
        }

        this.resolveReady();
    };

    View.prototype.onResize = function() {
        if (this.editor) {
            this.editor.resize();
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
