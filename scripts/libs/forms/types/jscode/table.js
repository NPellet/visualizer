define(['./default', 'libs/ace/ace'], function(FieldDefault) {
	var field = function(main) {
		this.main = main;
		this.divs = [];
		this.input = $("<input />");
	}
	field.prototype = $.extend({}, FieldDefault, {

		initHtml: function() {},
		buildHtml: function() {},
		addField: function(position) {
			var div = $("<div />");
			this.divs.splice(position, 0, div);
			this.input = $("<input />");
			return { html: div, index: position };
		},

		removeField: function(position) {
			this.divs.splice(position, 1)[0].remove();
		}


		startEditing: function(position) {
	
		},

		stopEditing: function() {},
		setValue: function() {}
	});

	return field;
}
