
define(['./default'], function(FieldDefault) {

	var field = function(main) {
		this.main = main;
	}

	field.prototype = $.extend({}, FieldDefault, {

		
		addField: function() {
			
			var fieldWrapper = $("<div />").addClass('bi-formfield-container');
			var right = $('<div class="bi-formfield-right"></div>').appendTo(fieldWrapper);
			var duplicate = $('<div class="bi-formfield-duplicate"></div>').appendTo(right);
			var label = $('<label class="bi-formfield-placeholder"></label>').appendTo(fieldWrapper);
			var img = $('<img class="bi-formfield-image" />').appendTo(fieldWrapper);
			var field = $('<input class="bi-formfield-styled" />').appendTo(fieldWrapper);

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
			
			if(this.autocompleteOptions) {
				this.main.dom.find('input[type="text"]').autocomplete({
					minLength: 0,
					source: this.autocompleteOptions
				});
			}

			// Change the input value will change the input hidden value
			var input = this.main.dom.on('keyup', 'input', function() {
				var input = $(this);
				var value = input.val();
				var index = input.parent().index();
				field.main.changeValue(index, value);	
			}).on('focus', 'input', function() {
				var input = $(this);
				var index = input.parent().index();
				if(input.val().length == 0)
					field.main.fields[index].placeholder.animate({opacity: 0.4}, 400);
			}).bind('blur', 'input', function() {
				var input = $(this);
				var index = input.parent().index();
				if(input.val().length == 0)
					field.main.fields[index].placeholder.animate({opacity: 1}, 400);
			});
			
			this.placeholder = this.main.dom.on('click', 'label.bi-formfield-placeholder', function() {
				var index = $(this).parent().index();
				field.main.fields[index].field.focus();
			});
		}
	});

	return field;
});