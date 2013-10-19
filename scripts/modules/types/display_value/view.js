define(['modules/defaultview','util/datatraversing','util/domdeferred','util/api', 'util/typerenderer'], function(Default, Traversing, DomDeferred, API, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var html = "";
			html += '<div></div>';
			this.dom = $(html).css('display', 'table').css('height', '100%').css('width', '100%');
			this.module.getDomContent().html(this.dom);
			this.fillWithVal( this.module.getConfiguration( 'defaultvalue' ) );
		},
		
		onResize: function() {
			
		},
		
		blank: {
			value: function(varName) {
				this.dom.empty();
			}
		},
		
		inDom: function() {},

		update: {
			'color': function(color) {
				if(color === undefined)
					return;
				this.module.getDomContent().css('backgroundColor', color);
			},

			'value': function(moduleValue) {

				var view = this,
					sprintf = this.module.getConfiguration('sprintf');

				if(moduleValue == undefined) {

					this.fillWithVal( this.module.getConfiguration('defaultvalue') || '' );

				} else {

					Renderer.toScreen( moduleValue, this.module ).always(function(val) {

						try {

							if(sprintf && sprintf != "") {
								require(['libs/sprintf/sprintf'], function() {
									val = sprintf(sprintf, val);
									view.fillWithVal( val );	
								});
							} else {
								view.fillWithVal( val );
							}

						} catch( e ) {
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
				font = this.module.getConfiguration('font');
			
			var div = $("<div />").css({

				fontFamily: font || 'Arial',
				fontSize: fontsize || '10pt',
				color: fontcolor || '#000000',
				display: 'table-cell',
				'vertical-align': valign || 'top',
				textAlign: align || 'center',
				width: '100%',
				height: '100%'

			}).html(val);

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