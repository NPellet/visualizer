define(['./default'], function(FieldDefault) {

	var field = function(main) {
		this.main = main;
		this.checkboxLoaded = false;
		this.domReady = false;
	}

	field.prototype = $.extend({}, FieldDefault, {

		initHtml: function() {
			var field = this;
			// Change the input value will change the input hidden value	
			this.fillExpander();
			this._picker = this.main.domExpander.find('.bi-formfield-colorpicker').farbtastic(function(color) {
				field._hasChanged(color);
			});	
		},
		
		
		
		addField: function(position) {
			var div = $("<div />");
			this.divs.splice(position, 0, div)
			var input = $("<input />");
			return { html: div, field: div, input: input, index: position };
		},
		
		removeField: function(position) {
			this.divs.splice(position, 1)[0].remove();
		},

		startEditing: function(position) {
			var field = this.main.fields[position];
			field.field.html(this.main.getValue(position));
			$.farbtastic(this._picker).setColor(this.main.getValue(position));
			//this.main.fields[position].input.remove();
			this.main.toggleExpander(position);
		},

		stopEditing: function(position) {
			var field = this.main.fields[position];
			//this.main.changeValue(position, this.main.fields[position].input.val());
			
			this.main.hideExpander();
		},


		_setValueText: function(index, value) {

			this.main.fields[index].html.html(value);
			this.main.changeValue(index, value);
		}

	});

	return field;
});
