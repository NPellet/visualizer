
if(!BI.Forms.Fields.List)
	BI.Forms.Fields.List = {};

BI.Forms.Fields.List.JSCode = function(main) {
	this.main = main;	
}

BI.Forms.Fields.List.JSCode.prototype = new BI.Forms.Fields.JSCode();
BI.Forms.Fields.List.JSCode.prototype.buildHtml = BI.Forms.FieldGeneric.buildHtml;
BI.Forms.Fields.List.JSCode.prototype.addField = function() {

	var id = Date.now() + Math.round(Math.random() * 10000);
	var fieldWrapper = $("<div />").addClass('bi-formfield-container');
	var duplicate = $('<div class="bi-formfield-duplicate"></div>').appendTo(fieldWrapper);
	var label = $('<label class="bi-formfield-placeholder"></label>').appendTo(fieldWrapper);
	var img = $('<img class="bi-formfield-image" />').appendTo(fieldWrapper);
	var field = $('<div class="bi-formfield-jseditor" id="' + id + '"></div>').appendTo(fieldWrapper);
	
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

BI.Forms.Fields.List.JSCode.prototype.initHtml = function() {};
BI.Forms.Fields.List.JSCode.prototype.initField = function() {
	
	var field = this;
	var el = this.main.dom.find('.bi-formfield-jseditor');
	console.log(el.attr('id'));
	var editor = ace.edit(el.attr('id'));
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");

	editor.setPrintMarginColumn(false);
	editor.getSession().on('change', function(e) {
		var val = editor.getValue();
		var index = el.parent().index();
		field.main.changeValue(index, val);
	});

    $('#' + el.attr('id')).data('editor', editor);
};
