define(['modules/defaultview', 'libs/plot/plot', 'util/datatraversing', './gcms'], function(Default, Graph, Traversing, gcms) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		init: function() {

			var html = [];
			html.push('<div class="gcms"><div class="gc"></div><div class="ms"></div></div>');
			this.namedSeries = {};
			this.dom = $(html.join(''));
			this.module.getDomContent().html(this.dom);
		},

		
		inDom: function() {
			var self = this;
			var _gcms = new gcms();
			_gcms.inDom(this.dom.find('.gc').get(0), this.dom.find('.ms').get(0));
			this.gcms = _gcms;
		},

		onResize: function(width, height) {
			this.gcms.resize(width, height);
		},
		
		update: {
			'gcms': function(moduleValue) {

				this.gcms.setGC(moduleValue.gc);
				this.gcms.setMS(moduleValue.ms);
			}
		},

		getDom: function() {
			return this.dom;
		}
	});

	return view;
});

 
