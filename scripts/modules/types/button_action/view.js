define(['modules/defaultview', 'forms/button'], function(Default, Button) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			this.dom = $('<div></div>');

			var self = this,
				button = new Button('Do this action', function(button) {
					self.module.controller.onClick(button.value);
				}, 

				{ 
					color: 'Grey',
					disabled: false,
					checkbox: true
				});

			this.module.getDomContent().html(this.dom);
			this.dom.html(button.render());
			this.button = button;
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