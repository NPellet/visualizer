
define(['forms/fielddefault', 'ckeditor'], function(Default) {
	

	CKEDITOR.disableAutoInline = true;


	return $.extend({}, Default, {

		initHtml: function() {		
			var field = this;
			// Change the input value will change the input hidden value
			var input = this.main.dom.on('click', 'div.bi-formfield-field-container > div', function(event) {
				event.stopPropagation();
				//field.setValue($(this).index());
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
		},
		
		setValue: function(index, value) {
			
			var field = this.main.fields[index].field;
			this.main.changeValue(index, value);
			CKEDITOR.instances[field.children().attr('name')].setData(value);
		},
		
		addField: function(position) {
			
			var fieldWrapper = $("<div />").addClass('bi-formfield-container');
			var duplicate = $('<div class="bi-formfield-duplicate"></div>').appendTo(fieldWrapper);
			var img = $('<img class="bi-formfield-image" />').appendTo(fieldWrapper);
			var field = $('<div class="bi-formfield-styled"><textarea name="' + Date.now() + Math.random() + '"></textarea></div>').appendTo(fieldWrapper);
			
			var pos = 0;
			if(typeof position == "undefined")
				this.main.fieldContainer.append(fieldWrapper);
			else if(typeof position == "number") {
				this.main.fields[position].append(fieldWrapper);
				pos = position + 1;
			}
			var self = this;
			
			return {index: pos, wrapper: fieldWrapper, placeholder: $(), duplicater: duplicate, field: field, image: img};
			
		},

		initField: function(index) {
			var self = this;
			var field = this.main.fields[index].field;
			var editor = CKEDITOR.replace(field.children().attr('name'), {
				extraPlugins: 'onchange'
			});
			editor.on('change', function() {			
				
				if(editor.checkDirty())
					self.main.changeValue(index, editor.getData());
			});
		},
		
		removeField: function(position) {
			
		}
	});
});

