

if(!BI.Forms.Fields.Table)
	BI.Forms.Fields.Table = {};
	

BI.Forms.Fields.Table.Text = function(main) {
	
	this.main = main;
	this.divs = [];
	this.input = $("<input />");
}

BI.Forms.Fields.Table.Text.prototype = new BI.Forms.Fields.Text();
BI.Forms.Fields.Table.Text.prototype.initHtml = function(tableWrapper) {
	
	
};

BI.Forms.Fields.Table.Text.prototype.buildHtml = function(tableWrapper) {
	
	
};

BI.Forms.Fields.Table.Text.prototype.addField = function(position) {
	var div = $("<div />");
	this.divs.splice(position, 0, div)
	this.input = $("<input />");
	return { html: div, index: position };
};
	
BI.Forms.Fields.Table.Text.prototype.removeField = function(position) {
	this.divs.splice(position, 1)[0].remove();
};

BI.Forms.Fields.Table.Text.prototype.startEditing = function(position) {
	this.divs[position].hide().after(this.input.val(this.main.getValue(position)));
	this.input.focus();
};

BI.Forms.Fields.Table.Text.prototype.stopEditing = function(position) {
	this.divs[position].show().html(this.input.val());
	this.input.remove();
	this.main.changeValue(position, this.input.val());
}


BI.Forms.Fields.Table.Text.prototype.setValue = function(index, value) {
	
	this.main.fields[index].html.html(value);
	this.main.changeValue(index, value);
}
