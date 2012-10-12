

if(!BI.Forms.Fields.Table)
	BI.Forms.Fields.Table = {};
	

BI.Forms.Fields.Table.Checkbox = function(main) {
	this.main = main;
}

BI.Forms.Fields.Table.Checkbox.prototype = new BI.Forms.Fields.Checkbox();

$.extend(BI.Forms.Fields.Table.Checkbox.prototype, {


	buildHtml: function() {},
	
		
	initHtml: function() { },
	
	addField: function(position) {
	
	},
	
	removeField: function(position) {
	
	},

	startEditing: function(position) {
	
	},

	stopEditing: function(position) {
	
	},

	setValue: function(index, value) {
	
	}
});