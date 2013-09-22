define(['jquery', 'util/versioning'], function($, Versioning) {

	var elements = [];
	return {

		init: function(urls) {
			var self = this;
			if(urls.header) {
				this.load(urls.header);
			} else {
				$("#header").remove();
			}

			Versioning.getViewHandler().versionChange().progress(function(el) {
				self.setTitle(el);
			});
		},

		setTitle: function(view) {
			var dom = $("#title");

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
				self.loadHeaderElements(data);
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


				case 'copyview':
					require(['main/elements/copyview'], function(El) {
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

			this.ul = this.ul || $("<ul />").appendTo("#header");
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