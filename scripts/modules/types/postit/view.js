define(['modules/defaultview', 'forms/button', 'util/util', 'main/grid', 'ckeditor'], function(Default, Button, Util, Grid) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this, cfg = this.module.getConfiguration(), id = Util.getNextUniqueId();
			this._id = id;

			this.dom = $('<div />', {  class: 'postit' });
			this.inside = $('<div>', { id: id, class: 'inside', contentEditable: 'true' }).bind('keyup', function() {
				cfg.text = $(this).html();
				self.module.getDomWrapper().height($(this).height() + 70);
				Grid.moduleResize(self.module);

				//console.log($(this).html());
			}).html(cfg.text || 'No text');

		
			this.dom.html(this.inside);
			this.module.getDomContent().html(this.dom);

			CKEDITOR.disableAutoInline = true;
		},

		inDom: function() {
			CKEDITOR.inline(this._id);
		},

		onResize: function() {},		
		blank: function() {},
		update: {

		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		}
	});

	return view;
});