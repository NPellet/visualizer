define(['jquery', 'util/versioning'], function($, Versioning) {

	var elements = [];
	return {

		init: function(urls) {
			var self = this;
			this.dom = $('<div id="header"><div id="title"><div></div></div></div>');
			$("body").prepend(this.dom);
			this.load( urls.header );
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

		load: function(url) {
			var self = this;
			$.getJSON(url, {}, function(data) {
				if(data.elements)
					self.loadHeaderElements(data.elements);
				self.setHeight(data.height || "30px");
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
					require(['main/elements/versioning'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;

				case 'versionloader': 
					require(['main/elements/versionloader'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;

				case 'autosavelocalview':
					require(['main/elements/autosavelocalview'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;

				case 'pasteview':
					require(['main/elements/pasteview'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;


				case 'pushviewtoserver':
					require(['main/elements/pushviewtoserver'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;


				case 'copyview':
					require(['main/elements/copyview'], function(El) {
						el = new El();
						el.init(source);
						def.resolve(el);
					});
				break;



				case 'blankview':
					require(['main/elements/blankview'], function(El) {
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