

if(!BI.Forms.Fields.Table)
	BI.Forms.Fields.Table = {};
	

BI.Forms.Fields.Table.Options = function(main) {
	this.main = main;
}

BI.Forms.Fields.Table.Options.prototype = new BI.Forms.Fields.Options();

$.extend(BI.Forms.Fields.Table.Options.prototype, {


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