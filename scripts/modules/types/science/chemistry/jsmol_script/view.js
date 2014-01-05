define(['modules/defaultview','util/datatraversing','util/domdeferred','util/api'], function(Default, Traversing, DomDeferred, API) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var cfg = $.proxy(this.module.getConfiguration, this.module), view = this;
			var html = $('<div>');
			html.css("text-align","center");
			html.css("padding",cfg('padding'));

			this.dom = html ;
			this.module.getDomContent().html(this.dom);
			this.textbox = null ;
			this.button = null ;

			this.fillWithScript();
		},


		onResize: function() {
			if(this.textbox){
				margin = 20 ;
				this.textbox.height( this.height - this.button.height() - margin );
			}
		},
		
		blank: function() {
			this.dom.empty();
		},
		
		inDom: function() {},

		update: {

			'script': function(script) {
				
				var cfg = $.proxy(this.module.getConfiguration, this.module), view = this;
				cfg('script') = script ;
				view.fillWithScript();

			},

			'btnvalue': function(value) {

                var cfg = $.proxy(this.module.getConfiguration, this.module), view = this;
				cfg('btnvalue') = value ;
				view.fillWithScript();

			}
		},

        getIsEditable:function(){
            var ised = this.module.getConfiguration('iseditable',false) ;
            return ised.length > 0 ;
        },

		fillWithScript: function() {

            var cfg = $.proxy(this.module.getConfiguration, this.module);
			var self = this, view = this ;
			var dom = self.dom

			dom.html("");

			var button = null ;
			if(cfg('btnvalue')){
				var button = $('<div>').html(cfg('btnvalue')).addClass("form-button");
				button.on("click",function(){
					self.module.controller.onButtonClick();
					return false ;
				}) ;
			}

			var textbox = null ;
			if(this.getIsEditable()){
				textbox = $('<textarea>',{cols:20,rows:5}).html(cfg('script')).css({width:'95%'}) ;
				textbox.on('input',function(e,f){
					var s = cfg('script');
                    s[0] = $(this).val() ;
				});
			}

			self.textbox = textbox ;
			self.button = button ;

			dom.append(button);
			if(textbox)
				dom.prepend(textbox);
	
			DomDeferred.notify(button);

		},
		
		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {}
	});

	return view;
});