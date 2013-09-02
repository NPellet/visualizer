define(['modules/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this;
			this.dom = $('<div></div>');
			this.search = $('<div class="Search"></div>');
			this.dom.append(this.search);
			this.module.getDomContent().html(this.dom);

			if(searchparams = this.module.getConfiguration().searchparams) {
				for(var i in searchparams)
					this.search.append('<div><label>' + searchparams[i].label + '</label><input type="text" value="' + searchparams[i].defaultvalue + '" name="' + i +'" /></div>');
				
				var url = self.module.getConfiguration().url;
				this.search.on('keyup', 'input', function() {
					var searchTerm = $(this).val();
					var searchName = $(this).attr('name');
					self.module.controller.doSearch(searchName, searchTerm);
				});
			}			
		},

		inDom: function() {
			this.search.find('input').trigger('keyup');
		},
		
		onResize: function() {
		},
		
		blank: function() {
			
		},
		
		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		}

	});
	return view;
});
 
