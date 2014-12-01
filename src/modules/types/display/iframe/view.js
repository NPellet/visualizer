define(['modules/default/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		init: function() {
			this.dom = $('<iframe border="0" frameborder="none" width="100%" height="100%" />');

			// fix scroll bar
			// see http://stackoverflow.com/a/12726445/1247233 for explanations
			this.dom.css('vertical-align', 'bottom');

			this.module.getDomContent().html(this.dom);
			this.resolveReady();
		},

		
		blank: function() {
			this.dom.attr('src', null);
		},

		update: {

			url: function(moduleValue) {
				if(!moduleValue)
					return;
				
				this.dom.attr('src', moduleValue.get());
			},

			doi: function(moduleValue) {
				if(!moduleValue)
					return;
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
 

 
