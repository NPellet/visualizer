define(['modules/default/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		init: function() {	
			this.dom = $('<iframe border="0" frameborder="none" width="100%" height="100%" />');
			this.module.getDomContent().html(this.dom);
			var self = this;
		},

		
		blank: function() {
			this.dom.attr('src', null);
		},

		update: {

			url: function(moduleValue) {
				if(!moduleValue)
					return;
				
				this.dom.attr('src', moduleValue);
			},

			doi: function(moduleValue) {
				if(!moduleValue)
					return;
				console.log(moduleValue);
				this.dom.attr('src', "http://dx.doi.org/"+moduleValue.get());
			}
		},

		getDom: function() {
			return this.dom;
		},	
		
		typeToScreen: {
		}


	});
	return view;
});
 

 