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

						var input = self.module.getDataFromRel('input_object'),
							structure = self.module.getConfiguration('structure') || [],
							jpath;

						if( input.setChild ) {
							for( var i = 0, l = structure.length ; i < l ; i ++ ) {
								jpath = structure[ i ].groups.general[ 0 ].searchOnField[ 0 ];
								input.setChild( jpath, self.form.sectionElements.main[ 0 ].groupElements.main[ 0 ].fieldElements[ structure[ i ].groups.general[ 0 ].name[ 0 ] ][0].value );
							}
						}

						console.log( input );
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
			input_object: function( varValue, varName ) {

				var self = this,
					structure = this.module.getConfiguration('structure') || [],
					jpath;

				for( var i = 0, l = structure.length ; i < l ; i ++ ) {
					jpath = structure[ i ].groups.general[ 0 ].searchOnField[ 0 ];

					( function( j, jpath ) {

						varValue.getChild( jpath ).done( function( returned ) {
console.log( self.form.sectionElements.main[ 0 ].groupElements.main[ 0 ] );
							self.form.sectionElements.main[ 0 ].groupElements.main[ 0 ].fieldElements[ 
								structure[ i ].groups.general[ 0 ].name[ 0 ]
							][0].value = (returned.get());

						});
					

					}) ( i, jpath )
					
				}
			}
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		
		}
	});
	return view;
});
 