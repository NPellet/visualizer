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
	 			self.open(e.dataTransfer);
                                self.dom.removeClass('dragdrop-over');
	 		});
		},

		open: function(data) {
                    
                    if(!data.items.length)
                        return;
                    
                    var that = this;
                    var item = data.items[0];
                    
                    if(item.kind==="file") {
                        if( ! this.module.controller.leased ) {
				this.module.controller.onDropped( item.getAsFile() );
			}
                    } else {
                        item.getAsString(function(value){
                            that.module.controller.treatString(value);
                        });
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