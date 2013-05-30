

BI.Forms.Fields.Color = function(main) {
	this.main = main;
}

BI.Forms.Fields.Color.prototype = {


	buildHtml: BI.Forms.FieldGeneric.buildHtml,
	
		
	initHtml: function() {
		
		
		var field = this;
		// Change the input value will change the input hidden value
		var input = this.main.dom.on('click', 'div.bi-formfield-field-container > div', function(event) {
			event.stopPropagation();
			var index = $(this).index();
			$.farbtastic(field._picker).setColor(field.main.getValue(index));
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
			field._hasChanged(color);
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
		
		this.main.fields[index].field.html(str);		
	},
	
	fillExpander: function() {
		var field = this;
		var btn = new BI.Buttons.Button('Blank', function(e) {
			e.stopPropagation();
			field._hasChanged('');
		});
		html = $('<div class="bi-formfield-colorcontainer"><div class="bi-formfield-colorpicker"></div></div>');
		html.append(btn.render());
		this.main.domExpander.html(html);	
	}
}
