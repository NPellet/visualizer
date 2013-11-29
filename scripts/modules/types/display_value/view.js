define(['modules/defaultview', 'util/datatraversing', 'util/domdeferred', 'util/api', 'util/typerenderer'], function(Default, Traversing, DomDeferred, API, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var html = "";
			html += '<div></div>';
			
			this.dom = $( html ).css( { 
				display: 'table',
				height: '100%',
				width: '100%'
			} );

			this.module.getDomContent( ).html( this.dom );
			this.fillWithVal( this.module.getConfiguration( 'defaultvalue' ) );
		},
		
		blank: {
			value: function(varName) {
				this.dom.empty();
			}
		},
		
		inDom: function() {},

		update: {
			'color': function(color) {

				if( color === undefined ) {
					return;
				}

				this.module.getDomContent( ).css( 'backgroundColor', color );
			},

			'value': function(moduleValue) {
				var view = this,
					sprintfVal = this.module.getConfiguration('sprintf');

				if( moduleValue == undefined ) {

					this.fillWithVal( this.module.getConfiguration('defaultvalue') || '' );

				} else {

					Renderer.toScreen( moduleValue, this.module ).always(function(val) {
						if ( sprintfVal && sprintfVal != "" ) {

							try {
								require( [ 'libs/sprintf/sprintf' ], function( ) {
									val = sprintf( sprintfVal, val );
									view.fillWithVal( val );	
								});
							} catch( e ) {
								view.fillWithVal( val );
							}

						} else {
							view.fillWithVal( val );
						}

					});

				}
			}
		},
		
		fillWithVal: function(val) {
			
			var valign = this.module.getConfiguration('valign'),
				align = this.module.getConfiguration('align'),
				fontcolor = this.module.getConfiguration('fontcolor'),
				fontsize = this.module.getConfiguration('fontsize'),
				font = this.module.getConfiguration('font'),
				preformatted = this.module.getConfiguration('preformatted');
			
			var div = $("<div />").css( {
				fontFamily: font || 'Arial',
				fontSize: fontsize || '10pt',
				color: fontcolor || '#000000',
				display: 'table-cell',
				'vertical-align': valign || 'top',
				textAlign: align || 'center',
				width: '100%',
				height: '100%',
				'white-space': preformatted || 'normal'
			} ).html( val );

//			if (preformatted) div.html("<pre />").html( val );

			this.dom.html( div );
			DomDeferred.notify( div );
		},
		
		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {}
	});

	return view;
});