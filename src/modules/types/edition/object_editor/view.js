define(['modules/default/defaultview', "src/util/util","components/jsoneditor/jsoneditor-min"], function(Default, Util, jsoneditor) {

    function view() {
        this._id = Util.getNextUniqueId();
    }
    ;

    Util.loadCss('components/jsoneditor/jsoneditor-min.css');

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var html = '<div id="'+this._id+'"></div>';

            this.dom = $(html).css({
                height: '100%',
                width: '100%'
            });

            this.module.getDomContent( ).html(this.dom);
        },
        blank: {},
        inDom: function() {
            var mode = this.module.getConfiguration('editable');
            this.editor = new jsoneditor.JSONEditor(document.getElementById(this._id),{mode:mode,change:this.editorChanged,module:this.module});
        },
        update: {
            value : function(value) {
                this.editor.set(value.get());
            }
        },
        editorChanged: function() {
            this.module.controller.editorChanged(this.module.view.editor.get());
        }
      
    });

    return view;
});