define(['modules/default/defaultview', 'src/util/datatraversing', 'src/util/domdeferred', 'src/util/api', 'src/util/typerenderer'], function(Default, Traversing, DomDeferred, API, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var html = "";
			html += '<div></div>';
			
			this.dom = $( html ).css( { 
				display: 'table',
				'table-layout': 'fixed',
				height: '100%',
				width: '100%'
			} );

			this.values = {};
			this.module.getDomContent( ).html( this.dom );
			this.fillWithVal( this.module.getConfiguration( 'defaultvalue' ) );
			this.resolveReady();
			this._relsForLoading = [ 'value' ];
		},
		
		blank: {
			value: function(varName) {
				this.dom.empty();
			}
		},
		
		update: {
			'color': function(color) {

				if( color === undefined ) {
					return;
				}

				this.module.getDomContent( ).css( 'background-color', color.get() );
			},

			'value': function( varValue, varName ) {

				var view = this;
				
				/*if( varValue.onChange ) {
					varValue.onChange( function( value ) {
						view.render( value, varName );
					});
				}*/

				if( varValue == undefined ) {

					this.fillWithVal( this.module.getConfiguration('defaultvalue') || '' );

				} else {

					this.render( varValue, varName );
				}
			}
		},

		render: function( varValue, varName ) {

			var self = this;
			
			var def = Renderer.toScreen( varValue, this.module );
			def.always( function( val ) {
				self.values[ varName ] = val;
				self.renderAll( val, def );
			} );
		},
		
		renderAll: function( val, def ) {

			var view = this,
				sprintfVal = this.module.getConfiguration('sprintf'),
				sprintfOrder = this.module.getConfiguration('sprintfOrder');

			if ( sprintfVal && sprintfVal != "" ) {

				try {
					require( [ 'components/sprintf/src/sprintf.min' ], function( ) {

						var args = [ sprintfVal ];
						for( var i in view.values ) {
							args.push( view.values[ i ] );	
						}

						val = sprintf.apply( this, args );

						view.fillWithVal( val, def );	
					});

				} catch( e ) {

					view.fillWithVal( val, def );

				}

			} else {
				view.fillWithVal( val, def );
			}
		},

		fillWithVal: function(val, def) {
			
			var valign = this.module.getConfiguration('valign'),
				align = this.module.getConfiguration('align'),
				fontcolor = this.module.getConfiguration('fontcolor'),
				fontsize = this.module.getConfiguration('fontsize'),
				font = this.module.getConfiguration('font'),
				preformatted = this.module.getConfiguration('preformatted');

            var valstr = val!==undefined ? val.toString() : '';
			
			var div = $("<div />").css( {
				fontFamily: font || 'Arial',
				fontSize: fontsize || '10pt',
				color: fontcolor || '#000000',
				display: 'table-cell',
				'vertical-align': valign || 'top',
				textAlign: align || 'center',
				width: '100%',
				height: '100%',
				'white-space': preformatted || 'normal',
				'word-wrap':'break-word'
			} ).html( valstr );

//			if (preformatted) div.html("<pre />").html( val );

			this.dom.html( div );
			
			if(def && def.build) {
				def.build();
			}
			
			DomDeferred.notify( div );
		},
		
		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {}
	});

	return view;
});