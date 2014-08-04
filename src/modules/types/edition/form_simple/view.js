define(['modules/default/defaultview', 'src/util/datatraversing', 'src/util/api', 'lib/formcreator/formcreator'], function(Default, DataTraversing, API, FormCreator) {
	
	"use strict";

	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {

			this.dom = $('<div />');
			this.module.getDomContent( ).html( this.dom );
			this.callback = null;
			this.resolveReady();
		},

		inDom: function() {

			var self = this,
				structure = this.module.getConfiguration('structure') || [],
				tpl_file = this.module.getConfiguration('tpl_file'),
				trigger = this.module.getConfiguration('trigger'),
				tpl_html = this.module.getConfiguration('tpl_html'),
				form,
				def,
				input,
				options = {},
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

			var triggerFunction = function( ) {
console.log("a");
				if( self.lockEvents ) {
					return;
				}

				var val = new DataObject( this.getValue(), true );
				self.formValue = val;
//				self.module.controller.valueChanged( val );

				var input = self.module.getDataFromRel('input_object'),
					structure = self.module.getConfiguration('structure') || [],
					jpath;

				var el = new DataObject();

				console.log('d');

				if( input ) {
					
					if( self.module.getConfiguration( "replaceObj" ) ) {

						for( var i = 0, l = structure.length ; i < l ; i ++ ) {
							jpath = structure[ i ].groups.general[ 0 ].searchOnField[ 0 ];
							input.setChild( jpath, self.form.sectionElements.main[ 0 ].groupElements.main[ 0 ].fieldElements[ structure[ i ].groups.general[ 0 ].name[ 0 ] ][0].value, true );
						}

						self.module.model.dataTriggerChange( input );

					} else {

						for( var i = 0, l = structure.length ; i < l ; i ++ ) {
							jpath = structure[ i ].groups.general[ 0 ].searchOnField[ 0 ];
							el.setChild( jpath, self.form.sectionElements.main[ 0 ].groupElements.main[ 0 ].fieldElements[ structure[ i ].groups.general[ 0 ].name[ 0 ] ][0].value )
	//						input.setChild( jpath, self.form.sectionElements.main[ 0 ].groupElements.main[ 0 ].fieldElements[ structure[ i ].groups.general[ 0 ].name[ 0 ] ][0].value );
						}

						console.log( el );
					}
				} else {
					el = val;
				}

				self.module.controller.valueChanged( el );
			}

			$.when( def ).done( function( tpl ) { 

				tpl = '<form><div style="position: relative;" class="form-sections-wrapper form-section-section-container"><div class="form-section" data-form-sectionname="main"><div class="form-section-group-container"><div class="form-group" data-form-groupname="main">' + tpl + '</div></div></div></div></form>';
				form = FormCreator.makeForm();
				
				switch( trigger ) {

					case 'btn':
                        var btnLabel = self.module.getConfiguration('btnLabel');
						form.addButton(btnLabel, { color: 'blue' }, $.proxy( triggerFunction, form ) );

					break;

					case 'change':

						options.onValueChanged = triggerFunction
					break;
				}

				form.init( options );

				form.setStructure( formStructure );
				form.onStructureLoaded( ).done( function( ) {

					form.fill( { } ); // For now let's keep it empty.

				} );


				
				form.onLoaded( ).done( function( ) {
					
					form.setTpl( tpl );
					
					self.dom.html( form.makeDomTpl() );
					form.inDom( );
				});
			});

			this.form = form;
		},
		

		update: {
			input_object: function( varValue, varName ) {

				var self = this;
				this.newValue( varValue );
				

				this.module.model.dataListenChange( varValue, function() {

					self.newValue( this );

				}, 'input_object');
			}
		},


		newValue: function( varValue ) {

			var self = this,
				structure = this.module.getConfiguration('structure') || [],
				jpath;

			self.lockEvents = true;
			self.nb = 0;

			for( var i = 0, l = structure.length ; i < l ; i ++ ) {
				jpath = structure[ i ].groups.general[ 0 ].searchOnField[ 0 ];

				( function( j, jpath ) {
					self.nb++;

					varValue.getChild( jpath, true ).done( function( returned ) {

						self
							.form
							.sectionElements
							.main[ 0 ]
							.groupElements
							.main[ 0 ]
							.fieldElements[ 

								structure[ j ].groups.general[ 0 ].name[ 0 ]

						][0]
							.value = ( returned.get( ) );

						self.nb--;
						if( self.nb == 0 ) {
							self.lockEvents = false;
						}
					});
			
				}) ( i, jpath );
				
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
 