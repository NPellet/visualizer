
define(['./default'], function(FieldDefault) {

	var field = function(main) {
		this.main = main;
		this.divs = [];
		this.input = $("<input />");
	}

	field.prototype = $.extend({}, FieldDefault, {

		addField: function() {
			var fieldWrapper = $("<div />").addClass('bi-formfield-container');
			var duplicate = $('<div class="bi-formfield-duplicate"></div>').appendTo(fieldWrapper);
			var label = $('<label class="bi-formfield-placeholder"></label>').appendTo(fieldWrapper);
			var img = $('<img class="bi-formfield-image" />').appendTo(fieldWrapper);
			var field = $('<textarea class="bi-formfield-styled"></textarea>').appendTo(fieldWrapper);
			
			var pos = 0;
			if(typeof position == "undefined")
				this.main.fieldContainer.append(fieldWrapper);
			else if(typeof position == "number") {
				this.main.fields[position].wrapper.after(fieldWrapper);
				pos = position + 1;
			}
			return {index: pos, placeholder: label, wrapper: fieldWrapper, duplicater: duplicate, field: field, image: img};		
		},

		initHtml: function() {

			var field = this;
			
			// Change the input value will change the input hidden value
			var input = this.main.dom.on('keyup', 'textarea', function() {
				var input = $(this);
				var value = input.val();
				var index = input.parent().index();
				field.main.changeValue(index, value);	
			}).on('focus', 'textarea', function() {
				var input = $(this);
				var index = input.parent().index();
				if(input.val().length == 0)
					field.main.fields[index].placeholder.animate({opacity: 0.4}, 400);
			}).bind('blur', 'textarea', function() {
				var input = $(this);
				var index = input.parent().index();
				if(input.val().length == 0)
					field.main.fields[index].placeholder.animate({opacity: 1}, 400);
			});
		}
	});

	return field;
});
