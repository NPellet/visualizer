define(['modules/defaultview', 'util/util', 'util/Versioning'], function(Default, Util, Versioning) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this, cfg = this.module.getConfiguration(), id = Util.getNextUniqueId(), done = false, inline;
			this._id = id;
			this.dom = $('<div />', {  class: 'dragdropzone' }).html(cfg.label || 'Drop your file here');
			this.module.getDomContent().html(this.dom);
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
				vartype = this.module.getConfiguration().vartype,
				obj;

			if(!this.reader) {
				this.reader = new FileReader();
				this.reader.onload = function(e) {

					var obj = e.target.result;				
					try {
						obj = JSON.parse(obj, Versioning.getDataHandler().reviver);
					} catch(_) {
						if(vartype)
							obj = new DataObject({ type: vartype, value: obj });
					}
					self.module.model.data = obj;
					self.module.controller.onDropped(obj);			
				}

				this.reader.onerror = function(e) {
					console.error(e);
				}
			}		

			this.reader.readAsText(file);
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