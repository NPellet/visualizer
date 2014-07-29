define([ 'modules/default/defaultview', 'src/util/typerenderer', 'src/util/api' ], function( Default, Renderer, API ) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var html = [];
			html.push( '<div class="ci-displaylist-list-2d"></div>' );
			this.dom = $( html.join('') );
			this.module.getDomContent().html( this.dom );

		},
                
                blank: {
                    list: function() {
                        API.killHighlight( this.module.getId() );
                        this.dom.empty();
                    }
                },
		
		inDom: function() {
			var self = this;
			this.module.getDomView().on('mouseenter mouseleave click', 'td', function(e) {
				var tdIndex = $(this).index();
				var trIndex = $(this).parent().index();
				var cols = self.module.getConfiguration('colnumber', 4) || 4;
				var elementId = trIndex * cols + tdIndex;
				var value = self.list.get()[elementId];
               if(e.type === "mouseenter") {
               		self.module.controller.setVarFromEvent( 'onHover', 'cell', 'list', [ elementId ] );
                    API.highlight(value, 1);
                }
                else if(e.type === "mouseleave") {
                    API.highlight(value, 0);
                }
                else if(e.type === "click") {
                    self.module.controller.setVarFromEvent( 'onClick', 'cell', 'list', [ elementId ] );
                    self.module.controller.sendAction('cell', value, 'onClick');
                }
			});
			this.resolveReady();
		},

		update: {

			list: function( moduleValue ) {

				this.defs = [];
				if(!(moduleValue instanceof Array)) {
					return;
				}

				var view = this,
					cfg = $.proxy( this.module.getConfiguration, this.module ),
					cols = cfg('colnumber', 4) || 4,
					sizeStyle = "",
					self = this,
					val = moduleValue.get(),
					table = $('<table cellpadding="3" cellspacing="0">').css("text-align", "center"),
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

				var current, colId;
				this._inDom = false;
				
				for( ; i < l ; i ++ ) {

					td = this.renderElement( view.list.getChildSync( i ), cols );
					colId = done % cols;

					if( colId === 0 ) {
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

						self.defs[ j ].then( function() {
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

				element.getChild( colorJpath , true ).then( function( val ) {
					td.css( 'background-color', val.get() );
				} );
			}

			this.defs.push( Renderer.toScreen( element, this.module, { }, valJpath ).always( function(val) {

				td.html(val);

			} ) );
                        
                        API.listenHighlight( element, function( onOff, key ) {
                            if(onOff) {
                                td.css("border-color", "black");
                            } else {
                                td.css("border-color", "");
                            }
			}, false, this.module.getId());
			
			return td;
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: { }
	});

	return view;
});


