define(['modules/defaultview'], function(Default) {
	
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

				if(moduleValue == undefined || !(moduleValue instanceof Array))
					return;

				var view = this, cfg = this.module.getConfiguration();
				var valJpath = cfg.valjpath;
				var colorJpath = cfg.colorjpath;

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
				CI.DataType.fetchElementIfNeeded(moduleValue).done(function(val) {
					self.list = val;
					var table = $('<table cellpadding="3" cellspacing="0">');
					
					var number = self.list.length, done = 0;
					for(var i = 0; i < self.list.length; i++) {
						
						async = CI.DataType.asyncToScreenHtml(self.list[i], view.module, valJpath);
						async.pipe(function(val) {

							var td = $("<td>").css({width: Math.round(100 / cols) + "%", height: cfg.height});
							if(colorJpath) {
								CI.DataType.getValueFromJPath(self.list[i], colorJpath).done(function(val) {
									td.css('background-color', val);
								});

							}
							td.html(val);
							
							colId = done % cols;
							if(colId == 0) {
								if(current)
									current.appendTo(table);
								current = $("<tr />");
							}

							done++;
							td.appendTo(current);

							if(done == number) {
								if(current)
									current.appendTo(table);

								if(view._inDom) {
									CI.Util.ResolveDOMDeferred(table);
								}

								view._inDom = true;
							}
						});
					}

				

					view.dom.html(table);

					if(view._inDom)
						CI.Util.ResolveDOMDeferred(table);
									view._inDom = true;

				});
				
			}
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
		}
	});

	return view;
});