

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
		
		var div = $('<div class="bi-formfield-checkboxcontainer"></div>');

		this._checkboxContainer = div;
		var pos = 0;
		
		this.domReady = true;
		this.loadCheckboxes();


		return { html: div, index: position };

		//return {index: pos, placeholder: $(), wrapper: fieldWrapper, duplicater: $(), field: field, image: img};
	},
	
	loadCheckboxes: function() {
		
		this.checkboxLoaded = true;
		var fieldId = this.main.getFieldId();
		var fieldAttrId;
		
		var html = [];
		
		for(var i in this.options) {
			fieldAttrId = fieldId + "_" + i;
			
			html.push('<input type="checkbox" name="');
			html.push(this.main.getFieldName(1));
			html.push('[]" id="');
			html.push(fieldAttrId);
			html.push('" value="');
			html.push(i);
			html.push('" data-name="');
			html.push(i)
			html.push('"/><label for="');
			html.push(fieldAttrId);
			html.push('">');
			html.push(this.options[i]);
			html.push('</label>');
		}
		if(!this._checkboxContainer)
			return;
		
		this._checkboxContainer.empty().html(html.join(''));
		
		var impl = this;
		this._checkboxContainer.bind('click', 'input', function() {
			var val = [];
			impl._checkboxContainer.find('input:checked').each(function() {
				val.push($(this).data('name'));
			});
			// No duplication ==> all at 0 index
			impl.main.changeValue(0, val);
		});
	},


	removeField: function(position) {
	
	},

	startEditing: function(position) {
	
	},

	stopEditing: function(position) {
	
	},

});