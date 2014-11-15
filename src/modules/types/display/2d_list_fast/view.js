define([ 'modules/default/defaultview', 'src/util/typerenderer', 'src/util/api' ], function( Default, Renderer, API ) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {
			this.dom = $('<div class="ci-displaylist-list-2d-fast"></div>');
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
			this.dom.on('mouseenter mouseleave click', '> div', function(e) {
				var elementId = $(this).index();
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
				if(!Array.isArray(moduleValue)) {
					return;
				}

				var view = this,
					cfg = $.proxy( this.module.getConfiguration, this.module ),
					cols = (100/(cfg('colnumber', 4) || 4))+"%",
					self = this,
					val = moduleValue.get(),
					l = val.length,
					i = 0;
			
				this.dataReady = $.Deferred();
				var dataDivs = Array(l);

				self.list = val;
				
				var cfg = $.proxy( this.module.getConfiguration, this.module ),
				colorJpath = cfg('colorjpath', false),
				valJpath = cfg('valjpath', ''),
				dimensions = {
					width: cols
				};
				var height = cfg('height');
				if(height)
					dimensions.height = height;
				
				for( ; i < l ; i ++ ) {

					dataDivs[i] = this.renderElement( view.list.getChildSync( [i] ), dimensions, colorJpath, valJpath ).appendTo(view.dom);
					
				}
				
				this.dataReady.resolve(dataDivs);
				this.updateVisibility();

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
			},
			
			showList: function( value ) {
				if(!Array.isArray(value)) {
					return;
				}
				
				this.showList = value;
				
				this.updateVisibility();
			}
		},
		
		updateVisibility: function() {
			if(!this.showList || !this.list)
				return;
			
			var that = this;
			
			this.dataReady.then(function(dataDivs){
					var value = that.showList;
					var i = 0, ii = value.length;
					for(; i < ii; i++) {
						value[i] ? dataDivs[i].show() : dataDivs[i].hide();
					}
			});
		},

		renderElement: function(element, dimensions, colorJpath, valJpath) {

			var td = $( "<div>" ).css( dimensions );

			if( colorJpath ) {

				element.getChild( colorJpath , true ).done( function( val ) {
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


