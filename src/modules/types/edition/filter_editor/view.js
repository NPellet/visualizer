define(['modules/types/client_interaction/code_editor/view', "src/util/util", "ace/ace", "src/util/context", "jquery"], function(CodeEditor, Util, ace, Context, $) {

    function view() {
    }
    view.prototype = Object.create(CodeEditor.prototype);
    view.prototype.init = function() {
        CodeEditor.prototype.init.call(this);
        this._object = new DataObject();
    };
    view.prototype.inDom = function() {
        var self = this;

        this.editable = true;
        $('<div id="' + this._id + '"></div>').css("height", "100%").css("width", "100%").appendTo(this.editorCell);
        this.editor = ace.edit(this._id);
        var initVal = this.module.getConfiguration('script') || "";
        this._code.value = initVal;
        this.editor.getSession().setMode("./mode/javascript");
        this.editor.setValue(initVal);
        this.editor.getSession().on('change', function() {
            self.editorChanged();
        });

        this.onReady.resolve();
    };

    view.prototype.editorChanged = function() {
        var val = this.editor.getValue();
        this._code.value = val;
        this.module.definition.configuration.groups.group[0].script[0] = val;
        this.module.controller.onEditorChanged(this._code, this._object);
    };

    view.prototype.update.dataobject = function(value) {
        this._object = value;
        this.editorChanged();
    };

    return view;
});