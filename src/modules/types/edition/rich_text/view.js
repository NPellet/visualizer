define(['modules/default/defaultview', 'src/util/util', 'ckeditor'], function(Default, Util, CKEDITOR) {

    function view() {
		this._id = Util.getNextUniqueId();
    }

    view.prototype = $.extend(true, {}, Default, {
        init: function() {
			var initText = this.module.definition.richtext || '';
            var html = $('<div id="'+this._id+'" contenteditable="true">');
            this.dom = $(html).css({
                height: '100%',
                width: '100%',
				padding: "5px",
				boxSizing: "border-box"
            }).html(initText);
            this.module.getDomContent().html(this.dom);
			this.module.controller.valueChanged(initText);
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
			this.resolveReady();
        }
    });

    return view;
});