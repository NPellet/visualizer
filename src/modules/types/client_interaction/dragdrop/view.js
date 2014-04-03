define(['modules/default/defaultview', 'src/util/util', 'src/util/versioning'], function(Default, Util, Versioning) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {
                    var self = this;
                    var textarea = $("<textarea>").css({
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: 0,
                            width: 0,
                            opacity:0
                        }).on("paste",function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            self.open(e.originalEvent.clipboardData);
                        });
                        var defaultMessage = this.module.getConfiguration( 'label' );
                        this.messages = {
                            'default': defaultMessage,
                            drag: this.module.getConfiguration( 'dragoverlabel', defaultMessage ),
                            hover: this.module.getConfiguration( 'hoverlabel', defaultMessage )
                        };
                        this.messageP=$('<p>').html(this.messages.default);
			this.dom = $('<div />', { class: 'dragdropzone' } ).html( this.messageP).on("click mousemove",function(){
                            textarea.focus();
                        }).mouseout(function(){
                            textarea.blur();
                        }).append(textarea);
			this.module.getDomContent().html( this.dom );
		},

		inDom: function() {

			var self = this, dom = this.dom.get(0);
	 		dom.addEventListener('mouseenter', function(e) {
	 			e.stopPropagation();
	 			e.preventDefault();
                                self.messageP.html(self.messages.hover);
	 			self.dom.addClass('dragdrop-over');
	 		});
                        
                        dom.addEventListener('dragenter', function(e) {
	 			e.stopPropagation();
	 			e.preventDefault();
                                self.messageP.html(self.messages.drag);
	 			self.dom.addClass('dragdrop-over');
	 		});

	 		dom.addEventListener('dragover', function(e) {
	 			e.stopPropagation();
	 			e.preventDefault();
	 		});
                        
                        dom.addEventListener('dragleave', function(e) {
	 			 e.stopPropagation();
	 			 e.preventDefault();
                                 self.messageP.html(self.messages.default);
	 			 self.dom.removeClass('dragdrop-over');
	 		});
                        
	 		dom.addEventListener('mouseleave', function(e) {
	 			 e.stopPropagation();
	 			 e.preventDefault();
                                 self.messageP.html(self.messages.default);
	 			 self.dom.removeClass('dragdrop-over');
	 		});

	 		dom.addEventListener('drop', function(e) {
	 			e.stopPropagation();
	 			e.preventDefault();
	 			self.open(e.dataTransfer);
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