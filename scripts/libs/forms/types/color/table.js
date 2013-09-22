define(['./default', 'util/util'], function(FieldDefault, Util) {

	var field = function(main) {
		this.main = main;
		this.checkboxLoaded = false;
		this.domReady = false;
		this.divs = [];
	}

	field.prototype = $.extend({}, FieldDefault, {

		initHtml: function() {
			var field = this;
			// Change the input value will change the input hidden value	
			this.fillExpander();
			field.rgb = field.rgb || [0, 0, 0]
			this._picker = this.main.domExpander.find('.bi-formfield-colorpicker').farbtastic(function(color) {
				field.rgb = Util.hexToRgb(color);
				field._hasChanged(field.rgb.concat(field.opacity || 1));
				//field._hasChanged(color);
			});	


			this.main.domExpander.find('.bi-formfield-coloropacity > input').spinner({
				step: 0.01,
      			numberFormat: "n",
      			min: 0,
      			max: 1,
      			spin: function(e, ui) {
      				field.opacity = ui.value;
      				field._hasChanged((field.rgb || [0, 0, 0]).concat(field.opacity || 1));
      			}
			}).parent().on('click', function(e) {
				e.stopPropagation();
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
			var color = this.main.getValue(position);
			$.farbtastic(this._picker).setColor(Util.rgbToHex(color[0], color[1], color[2]));
			this.main.domExpander.find('.bi-formfield-coloropacity input').spinner('value', color[3]);
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
