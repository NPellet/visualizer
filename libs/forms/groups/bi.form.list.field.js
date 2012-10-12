
BI.Forms.List = {};
BI.Forms.List.Field = function(options) {
	this.init(options, 'List');
}


BI.Forms.List.Field.prototype = new BI.Forms.Field();


BI.Forms.List.Field.prototype.buildHtml = function() {
	
	var html = [];
	html.push('<div id="bi-formfield-');
	html.push(this.fieldIdAbs);
	html.push('" class="bi-formfield-element bi-formfield-type-');
	html.push(this.options.type.toLowerCase());
	html.push('">');
	html.push('<div class="bi-formfield-vals"></div>');
	html.push(this.implementation.buildHtml());
	html.push('<div class="bi-formfield-expand"></div>')
	html.push('</div>');
	
	return html.join('');
};

BI.Forms.List.Field.prototype.afterInit = function() {
	var field = this;
	this.isInit = true;
	this.dom = $("#bi-formfield-" + this.fieldIdAbs);
	this.inputContainer = this.dom.children('.bi-formfield-vals');
	this.fieldContainer = this.dom.children('.bi-formfield-field-container');
	
	this.domExpander = this.dom.find('.bi-formfield-expand').data('field', this);
	this.implementation.initHtml();
	
	this.fieldContainer.on('click', '.bi-formfield-duplicate > span', function() {
		var index = $(this).parent().parent().index();
		if($(this).hasClass('bi-formfield-add'))
			field.addField(index);
		else
			field.removeField(index);
		field.doDuplicateRefresh();
	});
	
	
	this.addField();
	this.renumberInputs();
	this.doDuplicateRefresh();
	return this.dom;
};
	
BI.Forms.List.Field.prototype.doDuplicateRefresh = function() {
	
	var add = '<span class="bi-formfield-add">+</span>';
	var remove = '<span class="bi-formfield-remove">-</span>';
	
	for(var i = 0; i < this.fields.length; i++) {
		this.fields[i].duplicater.empty();
		if(!this.options.multiple)
			continue;
		this.fields[i].duplicater.append(this.fields.length == 1 ? '' : remove).append(add);
	}
};
