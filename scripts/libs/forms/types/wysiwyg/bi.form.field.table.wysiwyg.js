

if(!BI.Forms.Fields.Table)
	BI.Forms.Fields.Table = {};
	

BI.Forms.Fields.Table.Wysiwyg = function(main) {
	this.main = main;
}

BI.Forms.Fields.Table.Wysiwyg.prototype = new BI.Forms.Fields.Wysiwyg();

$.extend(BI.Forms.Fields.Table.Wysiwyg.prototype, {


	buildHtml: function() {},
	
		
	initHtml: function() { },
	
	removeField: function(position) {
	
	},

	startEditing: function(position) {
	
	},

	stopEditing: function(position) {
	
	},

	setValue: function(index, value) {
	
	}
});