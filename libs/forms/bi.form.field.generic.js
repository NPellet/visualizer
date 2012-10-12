
BI.Forms.FieldGeneric = {
	
	
	addField: function(position) {
		
		var fieldWrapper = $("<div />").addClass('bi-formfield-container');
		var duplicate = $('<div class="bi-formfield-duplicate"></div>').appendTo(fieldWrapper);
		var label = $('<label class="bi-formfield-placeholder"></label>').appendTo(fieldWrapper);
		var img = $('<img class="bi-formfield-image" />').appendTo(fieldWrapper);
		var field = $('<div class="bi-formfield-styled"><div></div></div>').appendTo(fieldWrapper);
		
		var pos = 0;
		if(typeof position == "undefined")
			this.main.fieldContainer.append(fieldWrapper);
		else if(typeof position == "number") {
			this.main.fields[position].wrapper.after(fieldWrapper);
			pos = position + 1;
		}
		return {index: pos, placeholder: label, wrapper: fieldWrapper, duplicater: duplicate, field: field, image: img};
		
	},
	
	removeField: function(position) {
		
	},
	
	buildHtml: function() {
		var html = [];
		html.push('<div class="bi-formfield-field-container"></div>');
		return html.join('')	
	}
}
