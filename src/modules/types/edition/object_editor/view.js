define(['modules/default/defaultview', "src/util/util", "components/jsoneditor/jsoneditor-min", "src/util/context", "jquery"], function(Default, Util, jsoneditor, Context, $) {

    function view() {
        this._id = Util.getNextUniqueId();
    }
    ;

    Util.loadCss('components/jsoneditor/jsoneditor-min.css');

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var that = this;
            if (!this.dom) {
                this.dom = $('<div id="' + this._id + '"></div>').css({
                    height: '100%',
                    width: '100%'
                });
                this.module.getDomContent( ).html(this.dom);
                Context.listen(this.module.getDomWrapper().get(0), [], function(contextDom) {
                    var li = $('<li><a>Change editor type</a></li>');

                    var ul = $("<ul/>").appendTo(li);

                    var elements = {"Read": "view", "Edit": "tree", "Text": "text"};
                    for (var i in elements) {
                        var li2 = $("<li>").appendTo(ul);
                        li2.html('<a>' + i + '</a>');
                    }
                    $(contextDom).append(li);
                    li.bind('click', function(event) {
                        var mode = elements[event.target.text];
                        that.editor.setMode(mode);
                        that.module.definition.configuration.groups.group[0].editable[0] = mode; // temporary waiting for API
                    });
                });
            }

            this.onReady = $.Deferred();
        },
        blank: {},
        inDom: function() {
            this.dom.empty();
            var mode = this.module.getConfiguration('editable');
            this.expand = this.module.getConfiguration('expanded') || false;
            this.editor = new jsoneditor.JSONEditor(document.getElementById(this._id), {mode: mode, change: this.editorChanged, module: this.module});
            this.onReady.resolve();
        },
        update: {
            value: function(value) {
                this.editor.set(value.get());
                if (this.expand[0])
                    this.editor.expandAll();
            }
        },
        editorChanged: function() {
            this.module.controller.editorChanged(this.module.view.editor.get());
        }

    });

    return view;
});