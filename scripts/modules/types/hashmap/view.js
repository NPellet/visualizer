define(['modules/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			this.dom = $('<table></table>');
			this.module.getDomContent().html(this.dom);
		},
		
		inDom: function() {},

		onResize: function() {
			
		},
		
		update: {
			'hashmap': function(moduleValue) {
				
				if(!moduleValue)
					return;
				var view = this;
				view.dom.html('');

				var cfgg = this.module.getConfiguration();
				var cfg = cfgg.keys;

				var html = '';
				var def = [];
		
				for(var i in cfg) {
					(function(j) {
						def.push(CI.DataType.asyncToScreenHtml(moduleValue, view.module, cfg[i].key).pipe(function(html2) {

							if(html2 == "" && cfgg.hideemptylines)
								return;

							if(cfg[i].printf)
								html2 = sprintf(cfg[i].printf, html2);
							return '<tr><td>' + j + '</td><td>' + html2 + '</td></tr>';
						}));
					}) (i);
				}

				$.when.apply($, def).done(function() {
					var html = '';
					for(var i in arguments) {
						html += arguments[i];
					}
					view.dom.html(html);
					CI.Util.ResolveDOMDeferred(view.dom);
				});

				
				
				/*
				var type = CI.DataType.getType(moduleValue);
				CI.DataType.toScreen(moduleValue, this.module).done(function(html) {
					view.dom.append(html);
					CI.Util.ResolveDOMDeferred();
				});*/
			}
		},
		getDom: function() {
			return this.dom;
		},

		typeToScreen: {}
	});
	return view;
});
 