define(['modules/defaultview', 'forms/button'], function(Default, Button) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this;
			this.dom = $('<div />', { class: 'postit' });
			this.inside = $('<div>', { class: 'inside', contentEditable: 'true' }).bind('keyup', function() {
				self.module.getConfiguration().text = $(this).text();
			}).text(self.module.getConfiguration().text || 'No text');
			this.dom.html(this.inside);
			this.module.getDomContent().html(this.dom);
		},

		inDom: function() {},
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