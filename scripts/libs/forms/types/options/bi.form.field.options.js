

BI.Forms.Fields.Options = function(main) {
	
	this.main = main;
	this.checkboxLoaded = false;
	this.domReady = false;
}

BI.Forms.Fields.Options.prototype = {

	buildHtml: BI.Forms.FieldGeneric.buildHtml,
	
	initHtml: function() {
		var field = this;		
		if(typeof this.options != "undefined")
			this.loadRadios();
	},
	
	setText: function(index, text) {
		//this.main.fieldContainer.children().eq(index).html(text);
	},
	
	
	setOptions: function(options) {
		this.options = options;
		this.loadRadios();
		this.checkboxLoaded = true;
	},
	
	setOptionsUrl: function(url) {
		
		var field = this;
		$.ajax({
			url: url,
			dataType: 'xml',
			type: 'get',
			success: function(dataXml) {
				var xml = $($.parseXML(data)).children();
				var json = field.parseLazyRead(dom);
				field.options = json;
				this.checkboxLoaded = true;
				field.loadRadios();
			}
		});
	},
	
	loadRadios: function() {
		
		if(!this.main.isInit || typeof this.options == "undefined" || !this.checkboxLoaded || !this.domReady)
			return;
		
		this.checkboxLoaded = true;
		
		var fieldId = this.main.getFieldId();
		var fieldAttrId;
		
		var html = [];
		
		for(var i in this.options) {
			fieldAttrId = fieldId + "_" + i;
			html.push('<input type="radio" name="');
			html.push(this.main.getFieldName(1));
			html.push('" id="');
			html.push(fieldAttrId);
			html.push('" value="');
			html.push(i);
			html.push('" /><label for="');
			html.push(fieldAttrId);
			html.push('">');
			html.push(this.options[i]);
			html.push('</label>');
		}
		
		var impl = this;
		this._radioContainer.empty().html(html.join('')).children('input').customInput();
		this._radioContainer.bind('click', 'input', function() {
			var val = [];
			impl._radioContainer.find('input:checked').each(function() {
				val = $(this).val();
			});
			impl.main.changeValue(0, val);
		});
		
	},
	
	setValue: function(index, value) {
		this.main.dom.find('input[type=radio][value="' + value + '"]').attr('checked', 'checked');
		this.main.changeValue(index, value);
	},
	
	addField: function() {
	
		
		var fieldWrapper = $("<div />").addClass('bi-formfield-container');
		var img = $('<img class="bi-formfield-image" />');//.appendTo(fieldWrapper);
		var field = $('<div class="bi-formfield-checkboxcontainer"></div>').appendTo(fieldWrapper);
		this._radioContainer = field;
		
		var pos = 0;
		if(typeof position == "undefined")
			this.main.fieldContainer.append(fieldWrapper);
		else if(typeof position == "number") {
			this.main.fields[position].wrapper.after(fieldWrapper);
			pos = position + 1;
		}
		this.domReady = true;
		this.loadRadios();
		return {index: pos, placeholder: $(), wrapper: fieldWrapper, duplicater: $(), field: field, image: img};
		
	},
	removeField: BI.Forms.FieldGeneric.removeField
	
}