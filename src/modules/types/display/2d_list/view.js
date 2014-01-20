define([ 'modules/default/defaultview', 'src/util/typerenderer' ], function( Default, Renderer ) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var html = [];
			html.push( '<div class="ci-displaylist-list-2d"></div>' );
			this.dom = $( html.join('') );
			this.module.getDomContent().html( this.dom );

		},
		
		inDom: function() {
			var self = this;
			this.module.getDomView().on('hover', 'table td', function() {
				var tdIndex = $(this).index();
				var trIndex = $(this).parent().index();
				var cols = self.module.getConfiguration('colnumber', 4) || 4;
				var elementId = trIndex * cols + tdIndex;
				var value = self.list.get();
				self.module.controller.setVarFromEvent('onHover', value[elementId], 'cell');
			});

		},

		update: {

			list: function( moduleValue ) {

				this.defs = [];
				if(moduleValue == undefined || !(moduleValue instanceof Array)) {
					return;
				}

				var view = this,
					cfg = $.proxy( this.module.getConfiguration, this.module ),
					cols = cfg('colnumber', 4) || 4,
					sizeStyle = "",
					self = this,
					val = moduleValue.get(),
					table = $('<table cellpadding="3" cellspacing="0">'),
					l = val.length,
					done = 0,
					td,
					i = 0;

				self.list = val;

				if( cfg.width || cfg.height ) {

					if( cfg.width ) {

						sizeStyle += "width: " + Math.round(100 / cols) + "%; ";
					}

					if( cfg.height ) {

						sizeStyle += "height: " + cfg.height + "px; ";
					}
				}

				current = undefined;
				this._inDom = false;
				
				for( ; i < l ; i ++ ) {

					td = this.renderElement( view.list[ i ], cols );
					colId = done % cols;

					if( colId == 0 ) {
						if( current ) {
							current.appendTo( table );
						}
						current = $( "<tr />" );
					}

					done++;
					td.appendTo( current );
				}

				if( current ) {
					current.appendTo( table );
				}
				
				view.dom.html( table );

				i = 0;
				l = this.defs.length;

				for( ; i < l ; i ++ ) {
					
					( function( j ) {

						self.defs[ j ].done( function() {
							if( self.defs[ j ].build ) {
								self.defs[ j ].build( );
							}
						});

					} ) ( i );
				}				
			}
		},

		renderElement: function(element, cols) {

			var cfg = $.proxy( this.module.getConfiguration, this.module ),
				colorJpath = cfg('colorjpath', false),
				valJpath = cfg('valjpath', ''),
				td = $( "<td>" ).css( {
					width: Math.round(100 / cols) + "%", 
					height: cfg.height 
				} );

			if( colorJpath ) {

				element.getChild( colorJpath , true ).done( function( val ) {
					td.css( 'background-color', val );
				} );
			}

			this.defs.push( Renderer.toScreen( element, this.module, { }, valJpath ).always( function(val) {

				td.html(val);

			} ) );
			
			return td;
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: { }
	});

	return view;
});


