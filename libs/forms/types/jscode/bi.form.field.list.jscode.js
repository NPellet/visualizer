
if(!BI.Forms.Fields.List)
	BI.Forms.Fields.List = {};

BI.Forms.Fields.List.JSCode = function(main) {
	this.main = main;	
}

BI.Forms.Fields.List.JSCode.prototype = new BI.Forms.Fields.Text();
BI.Forms.Fields.List.JSCode.prototype.buildHtml = BI.Forms.FieldGeneric.buildHtml;
BI.Forms.Fields.List.JSCode.prototype.addField = function() {

	var id = Date.now() + Math.round(Math.random() * 10000);
	var fieldWrapper = $("<div />").addClass('bi-formfield-container');
	var duplicate = $('<div class="bi-formfield-duplicate"></div>').appendTo(fieldWrapper);
	var label = $('<label class="bi-formfield-placeholder"></label>').appendTo(fieldWrapper);
	var img = $('<img class="bi-formfield-image" />').appendTo(fieldWrapper);
	var field = $('<div id="' + id + '" />').appendTo(fieldWrapper);
	
	var pos = 0;
	if(typeof position == "undefined")
		this.main.fieldContainer.append(fieldWrapper);
	else if(typeof position == "number") {
		this.main.fields[position].wrapper.after(fieldWrapper);
		pos = position + 1;
	}
	return {index: pos, placeholder: label, wrapper: fieldWrapper, duplicater: duplicate, field: field, image: img};
};
	
BI.Forms.Fields.List.JSCode.prototype.removeField = BI.Forms.FieldGeneric.removeField;

BI.Forms.Fields.List.JSCode.prototype.initHtml = function() {
	
	var field = this;
	
	var editor = ace.edit(this.main.dom.attr('id'));
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");

	editor.getSession().on('change', function(e) {
		var val = editor.getValue();
		var index = input.parent().index();
		field.main.changeValue(index, val);
	});
    field.main.dom.data('editor', editor);
};
