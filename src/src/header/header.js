define(['require', 'jquery', 'src/util/versioning'], function(require, $, Versioning) {
	"use strict";

	var elements = [];
	return {

		init: function(headerConfig) {
			var self = this;

			if (headerConfig.elements) {
				this.loadHeaderElements(headerConfig.elements);
			}

			this.dom = $('<div id="header"><div id="title"><div></div></div></div>');
			$("#ci-visualizer").prepend(this.dom);

			self.setHeight(headerConfig.height || "30px");
			this.setHeight("30px");

			this._titleDiv = $("#title").children('div');
			this._titleDiv.attr('contenteditable', 'true').bind('keypress', function(e) {
				e.stopPropagation();
				if (e.keyCode !== 13)
					return;
				e.preventDefault();
				$(this).trigger('blur');
			})
				.bind('blur', function() {
					Versioning.getView().configuration.set('title', $(this).text().replace(/[\r\n]/g, ""));
				});


			Versioning.getViewHandler( ).versionChange( ).progress(function(el) {

				self.setTitle(el);

			});

		},

		setHeight: function(height) {
			this.dom.css('height', height);
			$("#modules-grid").css('margin-top', '5px');
		},

		setTitle: function(view) {
			this._titleDiv.text(view.configuration ? view.configuration.title : 'Untitled');
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
			
            require(['./components/'+source.type], function(El) {
                var el = new El();
                el.init(source);
                def.resolve(el);
            });

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

	};

});