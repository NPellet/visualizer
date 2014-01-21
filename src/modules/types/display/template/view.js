define(['modules/default/defaultview', 'lib/mustache/mustache'], function(Default, Mustache) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var html = "";
			html += '<div></div>';
			
			this.dom = $( html ).css( { 
				height: '100%',
				width: '100%'
			} );

			this.module.getDomContent().html( this.dom );
            this.template = this.module.getConfiguration('template');
			Mustache.parse(this.template);
		},
		
		blank: {
			value: function(varName) {
				this.dom.empty();
			}
		},
		
		inDom: function() {},

		update: {
			'value': function(value) {

				if(!value) {
					return;
				}

				this.dom.html(Mustache.render(this.template, value));

			}
		}
	});

	return view;
});