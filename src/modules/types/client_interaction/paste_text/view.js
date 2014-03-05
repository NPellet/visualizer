define(['modules/default/defaultview','src/util/api'], function(Default, API) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var html = "";
			html += '<div></div>';
			
			this.dom = $( html ).css( { 
				height: '100%',
				width: '100%'
			} );

			this.module.getDomContent( ).html( this.dom );
		},
        inDom: function() {
            var that = this;
            var textarea = $("<textarea>").css({
                "box-sizing":"border-box",
                "width":"99%",
                "height":"99%"
            }).on("keyup", function() {
                that.module.controller.valueChanged(textarea.val());
            }).val(this.module.getConfiguration("thevalue"));
            this.dom.append(textarea);
            this.module.controller.valueChanged(textarea.val());
        }
	});

	return view;
});