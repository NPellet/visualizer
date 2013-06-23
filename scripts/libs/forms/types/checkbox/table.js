define(['./default'], function(FieldDefault) {

	var field = function(main) {
		this.main = main;
	}

	field.prototype = $.extend({}, FieldDefault, {

		buildHtml: function() {},
		initHtml: function() { },
		addField: function(position) {
			var div = $('<div class="bi-formfield-checkboxcontainer"></div>');
			this._checkboxContainer = div;
			var pos = 0;
			this.domReady = true;
			return { html: div, index: position };
		},
		
		initField: function(index) {
			this.loadCheckboxes(index);
		},
		
		loadCheckboxes: function(index) {
			
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
			this._checkboxContainer.on('click', 'input', function() {
				var val = [];
				
				if($(this).is(':checked'))
					val.push($(this).data('name'));
				
				impl.main.changeValue(index, val);
			});
		},


		removeField: function(position) {
		
		},

		startEditing: function(position) {
		
		},

		stopEditing: function(position) {
		
		}
	});

	return field;
});