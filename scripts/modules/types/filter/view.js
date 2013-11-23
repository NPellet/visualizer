define(['modules/defaultview', 'util/datatraversing', 'util/domdeferred', 'util/api', 'util/typerenderer'], function(Default, Traversing, DomDeferred, API, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
				

			this.dom = $( '<div>' ).css( { } );
			this.module.getDomContent( ).html( this.dom );

			var self = this,
				filters = this.module.getConfiguration( 'filters' ),
				i = 0,
				l = filters.length,
				allFields = {},
				cfg = {
					sections: {
						cfg: {
							groups: {
								cfg: {
									options: {
										type: 'list'
									},
									fields: allFields
								}
							}
						}
					}
				};

			for( ; i < l ; i ++ ) {

				if( ! filters[ i ].groups.general ) {
					continue;
				}

				allFields[ i ] = {
					type: filters[ i ].groups.general[ 0 ].type[ 0 ],
					title: filters[ i ].groups.general[ 0 ].label[ 0 ]
				};

				this.makeOptions( allFields[ i ], filters[ i ] );
			}

			require( [ './libs/forms2/form' ], function( Form ) {

				var form = new Form( );
				
				form.init( {
					onValueChanged: function( value ) {	}
				} );

				form.setStructure( cfg );
				form.onStructureLoaded().done(function() {
					form.fill({ });
				});

				form.addButton('Filter', { color: 'green' }, function() {
					
				});

				form.onLoaded( ).done( function( ) {
					self.dom.html( form.makeDom( 2 ) );
					form.inDom();
				});
			});
		},
		

		makeOptions: function( cfg, form ) {


			var type = form.groups.general[ 0 ].type[ 0 ];

			switch( type ) {

				case 'combo':
					cfg.options = this.makeComboOptions( form )
				break;

				case 'slider':
				
					cfg.min = parseFloat( form.groups.slider[ 0 ].start[ 0 ] || 0 );
					cfg.max = parseFloat( form.groups.slider[ 0 ].end[ 0 ] || 1 );
					cfg.step = parseFloat( form.groups.slider[ 0 ].step[ 0 ] || 0.1 );
				break;

			}
		},

		makeComboOptions: function( form ) {
			
			form = form.groups.options[ 0 ];

			var i = 0,
				l = form.length,
				cfg = [];

			for( ; i < l ; i ++ ) {
				cfg.push({ title: form[ i ].label, key: form[ i ].value });
			}

			return cfg;
		},


		blank: {
			value: function(varName) {
				this.dom.empty();
			}
		},
		
		inDom: function() {


		},

		update: {
		

		},
				
		typeToScreen: {}
	});

	return view;
});