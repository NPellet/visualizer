

BI.Forms.Fields.List = {};
BI.Forms.List = {};

BI.Forms.GroupFields.List = function(name) {
	
	this.name = name;
	this.fields = [];
	
}

BI.Forms.GroupFields.List.prototype = {
	
	addField: function(options) {
		var field = new BI.Forms.List.Field(options);
		this.fields.push(field);
		field.setGroupId(this.fields.length - 1);
		field.setGroup(this);
		return field;
	},
	
	setId: function(id) {
		this.id = id;
		
		if(this.dom) {
			this.dom.attr('data-groupfield-id', id);
			this.dom.data('groupfield-id', id);
		}
	},
	
	getId: function() {
		return this.id;
	},
	
	getName: function() {
		return this.name;
	},
	
	getFields: function() {
		return this.fields;
	},
	
	setSection: function(section) {
		this.section = section;
	},
	
	getSection: function() {
		return this.section;
	},
	
	buildHtml: function() {
		var html = [];
		html.push('<div class="bi-form-groupfields" data-groupfield-id="');
		html.push(this.getId());
		html.push('">');
		html.push(this.getSection().getForm().getTemplater().buildGroup.List.call(this));
		html.push('</div>');
		return html.join('');
	},
	
	afterInit: function() {
		
		this.dom = this.section.getDom().find('[data-group-id=' + this.getId() + ']');
		for(var i = 0; i < this.fields.length; i++)
			this.fields[i].afterInit();
	},

	duplicate: function(section) {
		
		var group = new BI.Forms.GroupFields.List(this.name);
		section.addFieldGroup(group);
		for(var i = 0; i < this.fields.length; i++)
			var field = this.fields[i].duplicate(group);
		return group;
	},
	
	remove: function() {
		
		for(var i = 0; i < this.fields.length; i++)
			this.fields[i].remove();
		
		this.dom.remove();
		this.getSection().removeFieldGroup(this);
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
	
	fill: function(group, xml) {
		
		var fieldsByName = [];
		for(var i = 0; i < group.fields.length; i++)
			fieldsByName[group.fields[i].getName()] = group.fields[i];
		
		xml.children().each(function() {
			var name = $(this).attr('name');
			var field = fieldsByName[name];
			
			field.resetDuplicate();
			$(this).children('value').each(function(i) {
				
				if(i > 0)
					field.addField();
					
				
				field.implementation.setValue(i, $(this).text());
				//field.setValue(i, $(this).text());
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
			field.resetDuplicate();
			for(var j = 0; j < json[i].length; j++) {
				if(j > 0)
					field.addField();

				field.implementation.setValue(j, json[i][j]);
			}
		}
	},
	
	getValue: function(values) {
		
		for(var i = 0; i < this.fields.length; i++) {
			var val = [];
			this.fields[i].fillValue(val);
			values[this.fields[i].getName()] = val;
		}
	}
}
