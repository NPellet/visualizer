define(['forms/fielddefault', 'libs/custominput/custominput'], function(Default) {

	return $.extend({}, Default, {

		initHtml: function() {
			var field = this;
			if(typeof this.options != "undefined")
				this.loadCheckboxes();
		},
		
		setText: function(index, text) {
		},
		
		setOptions: function(options) {
			this.options = options;
			this.loadCheckboxes();
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
					field.loadCheckboxes();
				}
			});
		},
		
		loadCheckboxes: function() {
			
			if(!this.main.isInit || typeof this.options == "undefined" || !this.checkboxLoaded || !this.domReady)
				return;
			
			this.checkboxLoaded = true			
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
				html.push('"');
				html.push('/><label for="');
				html.push(fieldAttrId);
				html.push('">');
				html.push(this.options[i]);
				html.push('</label>');
			}
			
			this._checkboxContainer.empty().html(html.join('')).children('input').customInput();
			
			var impl = this;
			this._checkboxContainer.bind('click', 'input', function() {
				var val = [];
				impl._checkboxContainer.find('input:checked').each(function() {
					val.push($(this).data('name'));
				});
				impl.main.changeValue(0, val);
			});
		},
		
		setValue: function(index, value) {
			var stack = this.main.fields[index].field || this.main.fields[index].html;
			if(!value instanceof Array)
				value = [value];
			
			for(var i = 0; i < value.length; i++) {
				var field = stack.find('input#' + this.main.getFieldId() + '_' + value[i]);
				if(field.length == 0)
					continue;
				if(value)
					field.attr('checked', 'checked');
				else
					field.removeAttr('checked');
				field.trigger('updateState')
			}
			this.main.changeValue(index, value);
		},
		
		addField: function() {
		
			
			var fieldWrapper = $("<div />").addClass('bi-formfield-container');
			var img = $('<img class="bi-formfield-image" />');//.appendTo(fieldWrapper);
			var field = $('<div class="bi-formfield-checkboxcontainer"></div>').appendTo(fieldWrapper);
			
			this._checkboxContainer = field;
			
			var pos = 0;
			if(typeof position == "undefined")
				this.main.fieldContainer.append(fieldWrapper);
			else if(typeof position == "number") {
				this.main.fields[position].wrapper.after(fieldWrapper);
				pos = position + 1;
			}
			this.domReady = true;
			this.loadCheckboxes();
			return {index: pos, placeholder: $(), wrapper: fieldWrapper, duplicater: $(), field: field, image: img};
			
		}
	});
});