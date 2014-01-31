define(['modules/default/defaultview', 'src/util/util', 'src/util/versioning'], function(Default, Util, Versioning) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			this.dom = $('<div />', { class: 'dragdropzone' } ).html( this.module.getConfiguration( 'label', 'Drop your file here' ));
			this.module.getDomContent().html( this.dom );
		},

		inDom: function() {

			var self = this, dom = this.dom.get(0);
	 		dom.addEventListener('dragenter', function(e) {
	 			e.stopPropagation();
	 			e.preventDefault();
	 			self.dom.addClass('dragdrop-over');
	 		});

	 		dom.addEventListener('dragover', function(e) {
	 			e.stopPropagation();
	 			e.preventDefault();
	 		});

	 		dom.addEventListener('dragleave', function(e) {
	 			 e.stopPropagation();
	 			 e.preventDefault();
	 			 self.dom.removeClass('dragdrop-over');
	 		});

	 		dom.addEventListener('drop', function(e) {
	 			e.stopPropagation();
	 			e.preventDefault();
	 			self.open(e.dataTransfer.files);
                                self.dom.removeClass('dragdrop-over');
	 		});

		},

		open: function(files) {
			var file = files[0];

			if( ! this.module.controller.leased ) {
				this.module.controller.onDropped( file );
			}
		},


		blank: {

		},

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