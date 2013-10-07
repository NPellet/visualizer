define(['jquery', 'forms/fieldlist'], function($, FieldList) {

	var group = function(name) {
		this.name = name;
		this.fields = [];
		this.options = {};	
	}

	group.prototype = {
		
		addField: function(options) {
			var field = new FieldList(options, this);
			this.fields.push(field);
			field.setGroupId(this.fields.length - 1);
			return field;
		},
		
		setId: function(id) {
			this.id = id;
			
			if(this.dom) {
				this.dom.attr('data-groupfield-id', id);
				this.dom.data('groupfield-id', id);
			}
		},
		
		getId: function() { return this.id; },
		getName: function() { return this.name; },
		getFields: function() { return this.fields; },
		setSection: function(section) { this.section = section; },
		getSection: function() { return this.section; },
		isVisible: function() { return this.options.visible; },
		
		buildHtml: function() {
			var html = [];
			html.push('<div class="bi-form-groupfields" data-groupfield-id="');
			html.push(this.getId());
			html.push('">');
			html.push(this.getSection().getForm().getTemplater().buildGroup.List.call(this.getSection().getForm().getTemplater(), this));
			html.push('</div>');
			return html.join('');
		},
		
		afterInit: function() {
			
			this.dom = this.section.getDom().find('[data-group-id=' + this.getId() + ']');
			for(var i = 0; i < this.fields.length; i++)
				this.fields[i].afterInit();
		},

		duplicate: function(section) {
			
			var _group = new group(this.name);
			section.addFieldGroup(_group);
			for(var i = 0; i < this.fields.length; i++)
				var field = this.fields[i].duplicate(_group);
			return _group;
		},
		
		remove: function() {
			for(var i = 0; i < this.fields.length; i++)
				this.fields[i].remove();
			this.dom.remove();
			this.getSection().removeFieldGroup(this);
		},


		empty: function() {
			
		},
		
		removeField: function(field) {
			this.fields[field.getGroupId()] = null;
			this.fields.splice(field.getGroupId(), 1);
			this.renumberFields();
		},
		
		renumberFields: function() {
			for(var i = 0; i < this.fields.length; i++)
				this.fields[i].getGroupId(i);
		},
		
		setStructure: function(structure) {
			var field, self = this;
			for(var i in structure.fields) {

				if(!structure.fields.hasOwnProperty(i))
					return;
				
				field = this.addField(structure.fields[i]);
				field.onChange(function(index, value) {
					self.getSection().getForm().onFieldChange(structure.fields[i].jpath || null, value, index);
				});

				if(structure.fields[i].options)
					field.onLoad(function(field, opts) {
						field.implementation.setOptions(opts)
					}, structure.fields[i].options);

				if(structure.fields[i].autoComplete)
					field.onLoad(function(field, opts) {
						field.implementation.setAutocompleteOptions(opts)
					}, structure.fields[i].autoComplete);
			}
		},


		fill: function(group, xml) {
			
			var fieldsByName = [];
			for(var i = 0; i < group.fields.length; i++)
				fieldsByName[group.fields[i].getName()] = group.fields[i];
			
			xml.children().each(function() {
				var name = $(this).attr('name');
				var field = fieldsByName[name];
				if(!field)
					return;
				field.resetDuplicate();
				$(this).children('value').each(function(i) {
					if(i > 0)
						field.addField();
					field.onLoad(function() {
						field.implementation.setValue(i, $(this).text());	
					});
				});
			});
		},
		
		fillJson: function(json) {
			var fieldsByName = [];

			for(var i = 0; i < this.fields.length; i++)
				fieldsByName[this.fields[i].getName()] = this.fields[i];
			
			for(var i in json) {
				var name = i;
				var field = fieldsByName[name];
				if(!field)
					continue;
				field.resetDuplicate();

				for(var j = 0; j < json[i].length; j++) {
					(function(k, val, f) {
						f.onLoad(function() {
							if(k > 0)
								f.addField();
							f.implementation.setValue(k, val);	
						});	
					}) (j, json[i][j], field);
				}
				
			}
		},
		
		getValue: function(values) {
			
			for(var i = 0; i < this.fields.length; i++) {
				var val = [];
				this.fields[i].fillValue(val);
				values[this.fields[i].getName()] = val;
			}
		},
		
		getValueFull: function(values) {		
			for(var i = 0; i < this.fields.length; i++) {
				var val = [];
				this.fields[i].fillValueFull(val);
				values[this.fields[i].getName()] = val;
			}
		}
	};

	return group;
});
