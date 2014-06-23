define(['modules/default/defaultview', 'forms/button', 'src/util/util', 'src/main/grid'], function(Default, Button, Util, Grid) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	

			var self = this,
				id = Util.getNextUniqueId(),
				done = false;

			this._id = id;

			this.dom = $('<div />', {  class: 'postit' }).css("font-family", this.module.getConfiguration("fontfamily")+", Arial");
			this.inside = $('<div>', { id: id, class: 'inside', contentEditable: 'true' }).html(self.module.definition.text || '');
			
			require(['ckeditor'], function(CKEDITOR) {
				if(done)
					return;
				CKEDITOR.disableAutoInline = true;
				self.instance = CKEDITOR.inline(self._id, {
					extraPlugins:"mathjax"
				});
				self.instance.on("change",function(){
					self.module.definition.text = self.instance.getData();
					self.module.getDomWrapper().height(self.inside.height() + 70);
					Grid.moduleResize(self.module);
				});
				done = true;
			});

			this.dom.html(this.inside);
			this.module.getDomContent().html(this.dom);
			
			this.resolveReady();			
		}
		
	});

	return view;
});