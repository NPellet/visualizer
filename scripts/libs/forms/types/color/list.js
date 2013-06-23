define(['./default'], function(FieldDefault) {

	var field = function(main) {
		this.main = main;
		this.checkboxLoaded = false;
		this.domReady = false;
	}

	field.prototype = $.extend({}, FieldDefault, {
		
	});

	return field;
});