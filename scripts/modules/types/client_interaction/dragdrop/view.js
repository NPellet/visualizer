define(['modules/defaultview', 'util/util', 'util/versioning'], function(Default, Util, Versioning) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this,
				id = Util.getNextUniqueId(),
				cfg = $.proxy(this.module.getConfiguration, this.module);

			this._id = id;
			this.dom = $('<div />', { class: 'dragdropzone' } ).html( this.module.getConfiguration( 'label', 'Drop your file here' ));
			this.module.getDomContent().html( this.dom );

			if (cfg('filter')) {
        		eval("self.filter = function(data) { try { \n " + cfg('filter') + "\n } catch(_) { console.log(_); } }");
      		} else {
      			// WTF ?
      			delete self.filter;
      		}
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
	 			 self.dom.removeClass('dragdrop');
	 		});

	 		dom.addEventListener('drop', function(e) {
	 			e.stopPropagation();
	 			e.preventDefault();
	 			self.open(e.dataTransfer.files);
	 		});

		},

		open: function(files) {
			var self = this,
				file = files[0],
				vartype = this.module.getConfiguration('vartype'),
				obj;

			if( ! self.module.controller.leased ) {
				self.module.controller.onDropped( file );
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