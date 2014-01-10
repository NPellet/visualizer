define(['modules/default/defaultview', 'src/util/datatraversing', 'src/util/api'], function(Default, DataTraversing, API) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {

			this.dom = $('<div />');
			this.module.getDomContent( ).html( this.dom );
			this.callback = null;
		},

		inDom: function() {

			var self = this,
				structure = this.module.getConfiguration('structure'),
				tpl_file = this.module.getConfiguration('tpl_file'),
				tpl_html = this.module.getConfiguration('tpl_html'),
				form;
			
			try {
				
				json = JSON.parse( structure );

			} catch(e) {
				return;
			}
		
			if( tpl_file ) {
				def = $.get( tpl_file, {} );	
			} else {
				def = tpl_html;
			}
			
			require(['./forms/form'], function(Form) {

				$.when( def ).done( function( tpl ) { 

					form = new Form({ });
					form.init({
						onValueChanged: function( value, fieldElement ) {
							var jpath = fieldElement.field.options.jpath;
						//	self.value.setChild( jpath, fieldElement.value );
						}
					});

					form.setStructure( json );
					form.onStructureLoaded( ).done( function( ) {
						form.fill( { } ); // For now let's keep it empty.
					} );

					form.onLoaded( ).done( function( ) {
						form.setTpl( tpl );
						self.dom.html( form.makeDomTpl() );
						form.inDom( );
					});
				});
			});
			this.form = form;
		},
		
		update: { },

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		
		}
	});
	return view;
});
 
