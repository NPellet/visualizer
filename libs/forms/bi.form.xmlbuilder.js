
BI.Forms.xmlBuilder = function(form) {
	
	this.form = form;
	
}

BI.Forms.xmlBuilder.prototype = {
	
	build: function(dom) {
		
		var title = this.getTitle(dom);
		
		this.form.setTitle(title);
		
		this.buildSection(this.form, dom);
	},
	
	
	buildSection: function(parent, dom) {
		
		var inst = this;
		dom.children('sections').children().each(function() {
			
			var dom = $(this);
			
			var section = new BI.Forms.Section(dom.attr('name'));
			section.setTitle(inst.getTitle(dom));
			
			parent.addSection(section);
			inst.buildSection(section, dom);
			inst.buildGroupFields(section, dom);
		});
	},
	
	buildGroupFields: function(section, dom) {
		
		var inst = this;
		dom.children('fields').children().each(function() {
			var domGroup = $(this);
			var name = $(this).attr('name');
			switch(this.nodeName) {
				
				default:
				case 'list':
					var groupfield = new BI.Forms.GroupFields.List(name);
				break;
			}
		
			section.addFieldGroup(groupfield);
			
			inst.buildFields(groupfield, domGroup);
			
		});
	},
	
	
	buildFields: function(group, dom) {
		
		var inst = this;
		
		dom.children().each(function() {
			var domField = $(this);
			var typeTranslated = inst.translateType(domField.attr('type'));
			
			var field = new BI.Forms.Field({
						type: typeTranslated,
						multiple: domField.attr('multiple') == "multiple" ? true : false,
						name: domField.attr('name'),
						placeholder: ""
					});
			
			var options;
			if((options = domField.children('options')).length == 1) {
				var optionsObj = {};
				options.each(function() {
					optionsObj[this.nodeName] = $(this).text();
				})

				field.implementation.setOptions(optionsObj);
			}
			
			field.setTitle(inst.getTitle(domField));
			
			group.addField(field);
			
		});
	},
	
	translateType: function(type) {
		
		switch(type) {
			
			
			case 'color':
				return 'Color';			
			break;
			
			case 'check-box':
				return 'Checkbox';
			break;
			
			default:
			case 'string':
				return 'Text';
			break;
			
			
		}
	},
	
	getTitle: function(dom) {
		
		var title = new BI.Forms.AnyTitle();
		var titleDom = dom.children('title');
		var icon = titleDom.attr('icon');
		titleDom.children().children().each(function() {
			var lang = this.nodeName;
			var val = $(this).text();
			title.setLabel(val, lang);
		});
		
		title.setIcon(icon);
		return title;
	}
}