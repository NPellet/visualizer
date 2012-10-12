
BI.Forms.Table = {};
BI.Forms.Table.Field = function(options) {
	
	this.init(options, 'Table');
}


BI.Forms.Table.Field.prototype = new BI.Forms.Field();


BI.Forms.Table.Field.prototype.buildHtml = function() {
	
	var html = [];
	
	return html.join('');
};

BI.Forms.Table.Field.prototype.afterInit = function(tableWrapper) {
	var field = this;
	this.isInit = true;
	this.dom = $("#bi-formfield-" + this.fieldIdAbs);
	this.inputContainer = $("<div />").appendTo(tableWrapper);
	this.domExpander = $('<div class="bi-formfield-expand" />').data('field', this).appendTo(tableWrapper).hide();
	
	this.implementation.initHtml();
	this.renumberInputs();

	return this.dom;
};


BI.Forms.Table.Field.prototype.showExpander = function(index) {
	
	// Hide the expander (unbind the document event before binding it again)
	this.hideExpander(true);
	
	// Bind event
	$(document).bind('click', this.handlerHideExpander);
	
	
	if(typeof this.implementation.expanderShowed == "function")
		this.implementation.expanderShowed(index);
	
	var input = this.fields[index].field.addClass('bi-expanded');
	var pos = input.position();
	var width = input.innerWidth();
	var height = input.innerHeight();
	
	this.expandedIndex = index;
	
	this.domExpander.css({top: pos.top + height, width: width}).slideDown(100);
	//this.group.stopEditing();
	
	this.domExpander.show().css({
		width: this.group.fieldsWidth + 1,
		marginLeft: 20
		
	});
	
}
