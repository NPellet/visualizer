

if(!BI.Forms.Fields.Table)
	BI.Forms.Fields.Table = {};
	

BI.Forms.Fields.Table.Textarea = function(main) {
	
	this.main = main;
	this.divs = [];
	this.input = $("<input />");
}

BI.Forms.Fields.Table.Textarea.prototype = new BI.Forms.Fields.Text();
BI.Forms.Fields.Table.Textarea.prototype.initHtml = function(tableWrapper) {
	
	
};

BI.Forms.Fields.Table.Textarea.prototype.buildHtml = function(tableWrapper) {
	
	
};

BI.Forms.Fields.Table.Textarea.prototype.addField = function(position) {
	var div = $("<div />");
	this.divs.splice(position, 0, div)
	this.input = $("<textarea />");
	return { html: div, index: position };
};
	
BI.Forms.Fields.Table.Textarea.prototype.removeField = function(position) {
	this.divs.splice(position, 1)[0].remove();
};

BI.Forms.Fields.Table.Textarea.prototype.startEditing = function(position) {
	this.divs[position].hide().after(this.input.text(this.main.getValue(position)));
	this.input.focus();
};

BI.Forms.Fields.Table.Textarea.prototype.stopEditing = function(position) {

	this.divs[position].show().html(this.input.val());
	this.input.remove();
	this.main.changeValue(position, this.input.val());
}

BI.Forms.Fields.Table.Textarea.prototype.setValue = function(index, value) {
	this.main.fields[index].html.html(value);
	this.main.changeValue(index, value);
}
