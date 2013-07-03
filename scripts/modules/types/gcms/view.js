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
			this.gcmsInstance = _gcms;

			if(this.setInit !== false)
				this.update.gcms.call(this, moduleValue);
		},

		onResize: function(width, height) {
			this.gcmsInstance.resize(width, height);
		},
		
		update: {
			'gcms': function(moduleValue) {
				this.setInit = false;
				if(!this.gcms)
					return;
				this.setInit = moduleValue;
				this.gcmsInstance.setGC(moduleValue.gc);
				this.gcmsInstance.setMS(moduleValue.ms);
			}
		},

		getDom: function() {
			return this.dom;
		}
	});

	return view;
});

 
