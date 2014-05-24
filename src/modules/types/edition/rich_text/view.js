define(['modules/default/defaultview', 'src/util/util', 'ckeditor'], function(Default, Util, CKEDITOR) {

    function view() {
		this._id = Util.getNextUniqueId();
    }

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
            var html = $('<div id="'+this._id+'" contenteditable="true">');
            this.dom = $(html).css({
                height: '100%',
                width: '100%',
				padding: "5px",
				boxSizing: "border-box"
            }).html(this.module.definition.richtext || '');
            this.module.getDomContent().html(this.dom);
        },
        inDom: function() {
			var self = this;
			CKEDITOR.disableAutoInline = true;
			this.instance = CKEDITOR.inline(this._id, {
				extraPlugins:"mathjax"
			});
			this.instance.on("change",function(){
				self.module.controller.valueChanged(self.instance.getData());
			});
        }
    });

    return view;
});