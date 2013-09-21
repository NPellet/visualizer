
define(['./default'], function(FieldDefault) {

	var field = function(main) {
		this.main = main;
	};

	field.prototype = $.extend({}, FieldDefault, {
		buildHtml: function() {},
		initHtml: function() { },
		removeField: function(position) {},
		startEditing: function(position) {},
		stopEditing: function(position) {}
	});

	return field;
});