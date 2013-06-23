define(['forms/fielddefault'], function(Default) {
	
	return $.extend({}, Default, {
		
		initHtml: function() {
			var field = this;
			// Change the input value will change the input hidden value
			var input = this.main.dom.on('click', 'div.bi-formfield-field-container > div', function(event) {
			//	event.stopPropagation();
				var index = $(this).index();
				field.main.toggleExpander($(this).index());
			});
			
			this.main.dom.on('click', '.bi-formfield-image-container > img', function(event) {
			//	event.stopPropagation();
				var index = $(this).index();
				field.main.fieldContainer.children().eq(index).trigger('click');
			});
			
			this.fillExpander();
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
			var button = new BI.Buttons.Button("Remove file");
		},

		setUploadURL: function(url) {
			this.uploadURL = url;
		},

		initField: function() { }
	});

});
