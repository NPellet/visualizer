define(['modules/default/defaultview', 'src/util/typerenderer'], function(Default, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			this.dom = $('<table><tbody></tbody></table>');
			this.module.getDomContent().html(this.dom);
		},
		
		inDom: function() {},

		onResize: function() {
			
		},

		renderElement: function( element, el, i, html ) {

			var self = this;

			Renderer.toScreen( element, this.module, { }, el.jpath ).always( function( value ) {

				if( value == "" && self.module.getConfiguration('hideemptylines', false) ) {
					return;
				}

				if( el.printf ) {
					value = sprintf( el.printf, value );
				}

				html.append( '<tr><td>' + el.label + '</td><td>' + value + '</td></tr>' );
			} );

		},
		
		update: {

			'hashmap': function(moduleValue) {
				
				if( ! moduleValue ) {
					return;
				}
				
				var cfg = this.module.getConfiguration('keys'),
					html = this.dom.children(' tbody ').empty(),
					i = 0,
					l = cfg.length; 
				
				for( ; i < l; i ++ ) {

					if( cfg[ i ].jpath != null) {

						this.renderElement ( moduleValue, cfg[ i ] , i, html);
						
					}
				}			
			}
		},

		getDom: function() {
			return this.dom;
		},

		typeToScreen: {}
	});
	return view;
});
 