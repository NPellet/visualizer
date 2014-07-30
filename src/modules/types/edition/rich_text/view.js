define([
    'modules/default/defaultview',
    'src/util/util',
    'ckeditor',
    'lodash',
    'src/util/typerenderer'
    ], function(Default, Util, CKEDITOR, _, Renderer) {

    function view() {
        this._id = Util.getNextUniqueId();
    }

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var self = this;
            var initText = this.module.definition.richtext || '';
            
            if(!this.module.getConfigurationCheckbox('editable', 'isEditable')) {
                var def = Renderer.toScreen({
                    type: 'html',
                    value: initText
                }, this.module );
                def.always( function( val ) {
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
        },
        inDom: function() {
            var self = this;
            if(this.module.getConfigurationCheckbox('editable', 'isEditable')) {
                CKEDITOR.disableAutoInline = true;
                this.instance = CKEDITOR.inline(this._id, {
                    extraPlugins:"mathjax"
                });
                this.instance.on("change",function(){
                    self.module.controller.valueChanged(self.instance.getData());
                });
            }
            this.resolveReady();
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

    return view;
});