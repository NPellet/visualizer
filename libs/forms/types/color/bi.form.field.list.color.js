

if(!BI.Forms.Fields.List)
	BI.Forms.Fields.List = {};
	

BI.Forms.Fields.List.Color = function(main) {
	this.main = main;
}

BI.Forms.Fields.List.Color.prototype = new BI.Forms.Fields.Color();

$.extend(BI.Forms.Fields.List.Color.prototype, {

	buildHtml: BI.Forms.FieldGeneric.buildHtml,
	
		
	initHtml: function() {
		
		
		var field = this;
		// Change the input value will change the input hidden value
		var input = this.main.dom.on('click', 'div.bi-formfield-field-container > div', function(event) {
			event.stopPropagation();
			var index = $(this).index();
			console.log(field.main.getValue(index));
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
	
	
	addField: BI.Forms.FieldGeneric.addField,
	removeField: BI.Forms.FieldGeneric.removeField
});