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
            
            if(!this._configCheckBox('editable', 'isEditable')) {
                var def = Renderer.toScreen({
                    type: 'html',
                    value: initText
                }, this.module );
                def.always( function( val ) {
                    self.dom = $('<div></div>').css({
                        height: '100%',
                        width: '100%',
                        padding: "5px",
                        boxSizing: "border-box"
                    }).html(initText);
                    self.module.getDomContent().html(self.dom);
                });   
            }
            else {
                var html = $(' <div id="'+this._id+'" contenteditable="true">');
                this.dom = $(html).css({
                    height: '100%',
                    width: '100%',
                    padding: "5px",
                    boxSizing: "border-box"
                }).html(initText);
                this.module.getDomContent().html(this.dom);
                this.module.controller.valueChanged(initText);
            }
        },
        inDom: function() {
            var self = this;
            if(this._configCheckBox('editable', 'isEditable')) {
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
        
        _configCheckBox: function(config, option) {
            return this.module.getConfiguration(config) && _.find(this.module.getConfiguration(config), function(val){
                return val === option;
            });
        },
    });

    return view;
});