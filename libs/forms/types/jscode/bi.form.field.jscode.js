

BI.Forms.Fields.JSCode = function(main) {
	
	this.main = main;
	
}

BI.Forms.Fields.JSCode.prototype = {

	setValue: function(index, value) {
		
		
		this.main.fields[index].field.data('editor').setValue(value);
		this.main.changeValue(index, value);
	}
}