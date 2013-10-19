define(['modules/defaultview', 'forms/button', 'util/util', 'main/grid'], function(Default, Button, Util, Grid) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	

			var self = this
				id = Util.getNextUniqueId(),
				done = false;

			this._id = id;

			this.dom = $('<div />', {  class: 'postit' });
			this.inside = $('<div>', { id: id, class: 'inside', contentEditable: 'true' }).bind('keyup', function() {

				self.module.definition.text = $(this).html();
				self.module.getDomWrapper().height($(this).height() + 70);
				Grid.moduleResize(self.module);

				//console.log($(this).html());
			}).html(self.module.definition.text || '').bind('focus', function() {
				require(['ckeditor'], function() {
					if(done)
						return;
					CKEDITOR.disableAutoInline = true;
					CKEDITOR.inline(self._id);
					done = true;
				});
			});

			this.dom.html(this.inside);
			this.module.getDomContent().html(this.dom);

			
		},

		inDom: function() {
			
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