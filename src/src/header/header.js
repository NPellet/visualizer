define(['require', 'jquery', 'src/util/versioning'], function(require, $, Versioning) {

	var elements = [];
	return {

		init: function( headerConfig ) {
			var self = this;

			if( headerConfig.elements ) {
				this.loadHeaderElements( headerConfig.elements );
			}

			this.dom = $('<div id="header"><div id="title"><div></div></div></div>');
			$("body").prepend(this.dom);

			self.setHeight( headerConfig.height || "30px" );
			this.setHeight( "30px" );

			Versioning.getViewHandler( ).versionChange( ).progress( function(el) {

				self.setTitle( el );
				
			} );

		},

		setHeight: function(height) {
			this.dom.css('height', height);
			$("#modules-grid").css('margin-top', '30px');
		},

		setTitle: function(view) {
			var dom = $("#title").children('div');

			dom
				.text(view.title || 'Untitled')
				.attr('contenteditable', 'true')
				.bind('keypress', function(e) {
					e.stopPropagation();
					if(e.keyCode !== 13)
						return;
					e.preventDefault();
					$(this).trigger('blur');
				})

				.bind('blur', function() {
					view.set('title', $(this).text().replace(/[\r\n]/g, ""));
				});
		},

		
		loadHeaderElements: function(all) {
			if(!$.isArray(all))
				return;

			var self = this,
				i = 0, 
				l = all.length;

			for (; i < l; i++) {
				this.addHeaderElement(i, this.createElement(all[i]));
			}

			$.when.apply($.when, elements).then(function() {
				self.buildHeaderElements(arguments);
			});
		},

		addHeaderElement: function(i, el) {
			elements[i] = el;
		},

		createElement: function(source) {
			var def = $.Deferred();
			
			switch(source.type) {
				case 'versioning':
					require(['./components/versioning'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;

				case 'versionloader': 
					require(['./components/versionloader'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;

				case 'autosavelocalview':
					require(['./components/autosavelocalview'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;

				case 'pasteview':
					require(['./components/pasteview'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;


				case 'pushviewtoserver':
					require(['./components/pushviewtoserver'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;


				case 'copyview':
					require(['./components/copyview'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;



				case 'blankview':
					require(['./components/blankview'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;


			}

			return def.promise();
		},

		buildHeaderElements: function(elements) {
			if(this.ul)
				this.ul.empty();

			this.ul = this.ul || $("<ul />").appendTo(this.dom);
			var i = 0, l = elements.length;
			for( ; i < l; i++) {
				this.ul.append(elements[i].getDom());
			}
		}

		// 'forms/button'
	}

			/*Header.addButtons(buttons, EntryPoint.getDataHandler(), EntryPoint.getViewHandler(), EntryPoint.getData(), EntryPoint.getView());
			
*/


	return {
		makeHeaderEditable: makeHeaderEditable,
	}
});