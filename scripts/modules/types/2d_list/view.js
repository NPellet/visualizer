define(['modules/defaultview', 'util/typerenderer'], function(Default, Renderer) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var html = [];
			html.push('<div class="ci-displaylist-list-2d"></div>');
			this.dom = $(html.join(''));
			this.module.getDomContent().html(this.dom);

		},
		
		onResize: function(w, h) { },
		inDom: function() {},

		update: {

			list: function(moduleValue) {

				this.defs = [];
				if(moduleValue == undefined || !(moduleValue instanceof Array))
					return;

				var view = this, cfg = this.module.getConfiguration();
				
				

				var cols = cfg.colnumber || 4;
				var sizeStyle = "";
				if(cfg.width || cfg.height) {
					if(cfg.width)
						sizeStyle += "width: " + Math.round(100 / cols) + "%; ";
					if(cfg.height)
						sizeStyle += "height: " + cfg.height + "px; ";
				}

				current = undefined;
				var self = this;
				this._inDom = false;
				var val = moduleValue.get();
				self.list = val;
				var table = $('<table cellpadding="3" cellspacing="0">');
				
				var number = self.list.length, done = 0, td;
				for(var i = 0; i < self.list.length; i++) {
					td = this.renderElement(self.list[i], cols);
			
					colId = done % cols;
					if(colId == 0) {
						if(current)
							current.appendTo(table);
						current = $("<tr />");
					}

					done++;
					td.appendTo(current);
				}

				view.dom.html(table);

				var self = this;
				for(var i = 0, l = this.defs.length; i < l; i++) {
					
					(function(j) {

					
						self.defs[j].done(function() {
							if(self.defs[j].build)
								self.defs[j].build();
							console.log('BUILD');
						});

					})(i);
					
				}


			/*	if(view._inDom)
					CI.Util.ResolveDOMDeferred(table);
								view._inDom = true;

		*/
				
			}
		},

		renderElement: function(element, cols) {
			var cfg = this.module.getConfiguration();
			var colorJpath = cfg.colorjpath;

			var valJpath = cfg.valjpath;
			var td = $("<td>").css({width: Math.round(100 / cols) + "%", height: cfg.height});

			if(colorJpath) {

				element.getChild(colorJpath, true).done(function(val) {
					td.css('background-color', val);
				});

			}
			var async = Renderer.toScreen(element, this.module, {}, valJpath);
			async.done(function(val) {	
				td.html(val);
			});

			this.defs.push(async);

			return td;
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
		}
	});

	return view;
});