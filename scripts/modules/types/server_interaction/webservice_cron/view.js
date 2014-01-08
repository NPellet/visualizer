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
		}

	});
	return view;
});
 