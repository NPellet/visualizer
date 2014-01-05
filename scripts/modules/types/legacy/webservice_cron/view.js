define(['modules/defaultview'], function(Default) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {	
			var self = this;
			this.dom = $('<div></div>');
			this.module.getDomContent().html(this.dom);
		},

		log: function(success, variable) {
			var time = new Date();
			this.dom.prepend('<div>[' + time.toLocaleString() + '] - ' + (success ? 'Ok' : 'Error') + '; Variable: ' + variable + '</div>')
		},


		blank: function() {
			this.domTable.empty();
			this.table = null;
		},

		update: {

		},

		buildElement: function(source, arrayToPush, jpaths, colorJPath) {
		
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		}

	});
	return view;
});
 