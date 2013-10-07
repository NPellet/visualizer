define(['forms/fielddefault', 'forms/button', 'util/util', 'libs/farbtastic/farbtastic'], function(Default, Button, Util) {

	Util.loadCss('scripts/libs/farbtastic/farbtastic.css');

	return $.extend({}, Default, {

		initHtml: function() {
			
			var field = this;
			// Change the input value will change the input hidden value
			var input = this.main.dom.on('click', 'div.bi-formfield-field-container > div', function(event) {
				event.stopPropagation();
				var v = field.main.getValue($(this).index());

				var color = Util.rgbToHex(v[0], v[1], v[2]);
				$.farbtastic(field._picker).setColor(color);

				field.main.domExpander.find('.bi-formfield-coloropacity input').spinner('value', v[3] || 1);
				field.main.toggleExpander($(this).index());
			});
			
			
			this.placeholder = this.main.dom.on('click', '.bi-formfield-placeholder-container > label', function(event) {
				event.stopPropagation();
				var index = $(this).index();
				field.main.fieldContainer.children().eq(index).trigger('click');
			});
			
			this.main.dom.on('click', '.bi-formfield-image-container > img', function(event) {
				event.stopPropagation();
				var index = $(this).index();
				field.main.fieldContainer.children().eq(index).trigger('click');
			});
			
			this.fillExpander();
			this._picker = this.main.domExpander.find('.bi-formfield-colorpicker').farbtastic(function(color) {
				field.rgb = Util.hexToRgb(color);
				field._hasChanged(field.rgb.concat(field.opacity || 1));
			});

			this.main.domExpander.find('.bi-formfield-coloropacity > input').spinner({
				step: 0.01,
      			numberFormat: "n",
      			min: 0,
      			max: 1
			}).bind('change', function() {
  				field.opacity = $(this).attr('value');
  				console.log(field.opacity);
  				field._hasChanged((field.rgb || [0, 0, 0]).concat(field.opacity || 1));

			}).parent().on('click', function(e) {
				e.stopPropagation();
			});
			
		},
		
		_hasChanged: function(color) {
			var expanded = this.main.findExpandedElement();
			if(!expanded)
				return;
				
			var index = expanded.index;
			this.main.changeValue(index, color);
			this._setValueText(index, color);
		},
		
		setValue: function(index, value) {
			
			this._setValueText(index, value);
			this.main.changeValue(index, value);
		},
		
		_setValueText: function(index, str) {
			console.log(this.main.fields);
			this.main.fields[index].field.html(str);		
		},
		
		fillExpander: function() {
			var field = this;
			html = $('<div class="bi-formfield-colorcontainer"><div class="bi-formfield-colorpicker"></div><div class="bi-formfield-coloropacity">Opacity: <input /></div></div>');
			this.main.domExpander.html(html);
		}
	});
});
