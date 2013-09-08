define(['require', 'modules/defaultview', 'libs/plot/plot', 'util/jcampconverter', 'util/datatraversing', 'util/api', 'util/util'], function(require, Default, Graph, JcampConverter, DataTraversing, API, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {
			this.series = {};
			this.colorvars = [];
			this.dom = $('<iframe />').attr('src', require.toUrl('./jsme.html'));
			this.module.getDomContent().html(this.dom);
			this.onReady = $.Deferred();
			var self = this;
			this.dom.bind('load', function() {
				self.dom.get(0).contentWindow.setController(self.module.controller);
			});
		},
		
		inDom: function() {
			var cfgM = this.module.getConfiguration();
			var self = this;
		},
		
		onResize: function(width, height) {
			this.width = width;
			this.height = height;

			this.dom.attr('width', width);
			this.dom.attr('height', height);

			this.module.getDomContent().css('overflow', 'hidden');
		},
		
		onProgress: function() {
			this.dom.html("Progress. Please wait...");
		},

		blank: function() {
		},

		update: { 

			'fromTo': function(moduleValue) {
				
				return;
			},

			'xArray': function(moduleValue, varname) {
				
			},
		},

		resetAnnotations: function() {

		//	Util.doAnnotations(this.annotations, this.graph)
		},

	
		onActionReceive: {
	
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		}
	});
	return view;
});
 

