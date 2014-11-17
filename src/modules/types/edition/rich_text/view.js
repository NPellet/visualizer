define([
    'modules/default/defaultview',
    'src/util/util',
    'ckeditor',
    'lodash',
    'src/util/typerenderer'
    ], function(Default, Util, CKEDITOR, _, Renderer) {

    function View() {
        this._id = Util.getNextUniqueId();
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function() {

        },
        inDom: function() {
            this.initEditor();
            this.resolveReady();
        },

        update: {
            html: function(moduleValue) {
                this.module.data = moduleValue;

                this.module.definition.richtext = moduleValue.get();
                //this.initEditor();
                this.updateEditor(moduleValue.get());
            }
        },

        initEditor: function() {
            var self = this;


            var initText = this.module.definition.richtext || '';
            if(!this.module.getConfigurationCheckbox('editable', 'isEditable')) {
                var def = Renderer.toScreen({
                    type: 'html',
                    value: initText
                }, this.module );
                def.always( function() {
                    self.dom = $( '<div id="'+this._id+ '">');
                    self._setCss();
                    self.dom.html(initText);
                    self.module.getDomContent().html(self.dom);
                });
            }
            else {
                this.dom = $(' <div id="'+this._id+'" contenteditable="true">');
                this._setCss();
                this.dom.html(initText);
                this.module.getDomContent().html(this.dom);
                this.module.controller.valueChanged(initText);
            }

            if(this.module.getConfigurationCheckbox('editable', 'isEditable')) {
                CKEDITOR.disableAutoInline = true;
                this.instance = CKEDITOR.inline(this._id, {
                    extraPlugins:"mathjax,smiley"
                });
                this.instance.on("change",function(){
                    self.module.controller.valueChanged(self.instance.getData());
                });
            }
        },

        updateEditor: function(html) {
            this.instance.setData(html);
        },
        
        _setCss: function() {
            this.dom.css({
                height: '100%',
                width: '100%',
                padding: "5px",
                boxSizing: "border-box"
            });
        }
    });

    return View;
});