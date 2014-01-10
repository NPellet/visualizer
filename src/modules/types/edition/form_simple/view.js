define(['modules/default/defaultview', 'src/util/datatraversing', 'src/util/api', 'lib/formcreator/formcreator'], function(Default, DataTraversing, API, FormCreator) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {

			this.dom = $('<div />');
			this.module.getDomContent( ).html( this.dom );
			this.callback = null;
		},

		inDom: function() {

			var self = this,
				structure = this.module.getConfiguration('structure') || [],
				tpl_file = this.module.getConfiguration('tpl_file'),
				tpl_html = this.module.getConfiguration('tpl_html'),
				form,
				formStructure = {
					sections: {
						main: {
							groups: {
								main: {
									options: {
										type: 'list',
										multiple: false
									},

									fields: FormCreator.makeStructure( structure )
								}
							}
						}
					}
				};

		
			if( tpl_file ) {
				def = $.get( tpl_file, {} );	
			} else {
				def = tpl_html;
			}

			$.when( def ).done( function( tpl ) { 

				tpl = '<form><div style="position: relative;" class="form-sections-wrapper form-section-section-container"><div class="form-section" data-form-sectionname="main"><div class="form-section-group-container"><div class="form-group" data-form-groupname="main">' + tpl + '</div></div></div></div></form>';
				form = FormCreator.makeForm();

				form.init({
					onValueChanged: function( value, fieldElement ) {
						var val = new DataObject( this.getValue(), true );
						self.formValue = val;
						self.module.controller.valueChanged( val );
					}
				});

				form.setStructure( formStructure );
				form.onStructureLoaded( ).done( function( ) {
					form.fill( { } ); // For now let's keep it empty.

				} );

				form.onLoaded( ).done( function( ) {
					
					form.setTpl( tpl );
					
					self.dom.html( form.makeDomTpl() );
					form.inDom( );

					self.module.controller.valueChanged( new DataObject( form.getValue(), true ) );
				});
			});

			this.form = form;
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
 