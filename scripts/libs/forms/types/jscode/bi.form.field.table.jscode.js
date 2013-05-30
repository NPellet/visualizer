

if(!BI.Forms.Fields.Table)
	BI.Forms.Fields.Table = {};
	

BI.Forms.Fields.Table.JSCode = function(main) {
	
	this.main = main;
	this.divs = [];
	this.input = $("<input />");
}

BI.Forms.Fields.Table.JSCode.prototype = new BI.Forms.Fields.Text();
BI.Forms.Fields.Table.JSCode.prototype.initHtml = function(tableWrapper) {
	
	
};

BI.Forms.Fields.Table.JSCode.prototype.buildHtml = function(tableWrapper) {
	
	
};

BI.Forms.Fields.Table.JSCode.prototype.addField = function(position) {
	var div = $("<div />");
	this.divs.splice(position, 0, div)
	this.input = $("<input />");
	return { html: div, index: position };
};
	
BI.Forms.Fields.Table.JSCode.prototype.removeField = function(position) {
	this.divs.splice(position, 1)[0].remove();
};

BI.Forms.Fields.Table.JSCode.prototype.startEditing = function(position) {
	
};

BI.Forms.Fields.Table.JSCode.prototype.stopEditing = function(position) {
	
}

BI.Forms.Fields.Table.JSCode.prototype.setValue = function(index, value) {
	
}
