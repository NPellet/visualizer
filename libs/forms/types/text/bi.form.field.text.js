

BI.Forms.Fields.Text = function(main) {
	
	this.main = main;
	
}

BI.Forms.Fields.Text.prototype = {

	setValue: function(index, value) {
		
		this.main.fields[index].field.val(value);
		this.main.changeValue(index, value);
	}
}