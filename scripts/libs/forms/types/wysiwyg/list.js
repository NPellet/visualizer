
define(['./default'], function(FieldDefault) {

	var field = function(main) {
		this.main = main;
	};

	field.prototype = $.extend({}, FieldDefault, {
		
	});

	return field;
});