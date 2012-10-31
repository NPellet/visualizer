

BI.Forms.Fields.Textarea = function(main) {
	
	this.main = main;
	
}

BI.Forms.Fields.Textarea.prototype = {

	setValue: function(index, value) {
		this.main.fields[index].field.val(value);
		this.main.changeValue(index, value);
	}
}