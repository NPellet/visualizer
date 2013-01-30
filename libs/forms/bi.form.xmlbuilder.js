
BI.Forms.xmlBuilder = function(form, options) {
	this.form = form || new BI.Forms.Form();
	this.jpathIndexation = [];
	this.options = $.extend({}, BI.Forms.xmlBuilder.prototype.defaults, options)
}

BI.Forms.xmlBuilder.prototype = {
	
	defaults: {
		onFieldChange: null
	},

	build: function(dom) {
		var title = this.getTitle(dom);
		this.form.setTitle(title);
		this.buildSection(this.form, dom);
		return this.form;
	},
	
	
	buildSection: function(parent, dom) {
		
		var inst = this;
		dom.children('sections').children().each(function() {

			var dom = $(this);
			var section = new BI.Forms.Section(dom.attr('name'), {
				visible: dom.attr('visible') == 'visible' || !dom.attr('visible')
			});
			section.setTitle(inst.getTitle(dom));
			parent.addSection(section);
			inst.buildSection(section, dom);
			inst.buildGroupFields(section, dom);
		});
	},
	
	buildGroupFields: function(section, dom) {
		
		var inst = this;
		dom.children('group').each(function() {
			var domGroup = $(this);
			var name = $(this).attr('name');
			switch(this.nodeName) {
				
				case 'table':
					var groupfield = new BI.Forms.GroupFields.Table(name);
				break;

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
			var jpath = domField.attr('jpath');

			var field = group.addField({
				type: typeTranslated,
				multiple: domField.attr('multiple') == "multiple" ? true : false,
				name: domField.attr('name'),
				placeholder: "",
				onChange: function(index, value) {
					if(inst.options.onFieldChange && jpath)
						inst.options.onFieldChange(jpath, value, index);
				}
			});

			if(jpath)
			inst.jpathIndexation[jpath] = field;
			
			var options;
			if((options = domField.children('options')).length == 1) {
				var optionsObj = [];
				options.children().each(function() {
					optionsObj.push({ key: this.nodeName, title: $(this).text(), data: {show: $(this).attr('show') }});
				});

				field.implementation.setOptions(optionsObj);
			}
			
			field.setTitle(inst.getTitle(domField));
			
			//group.addField(field);
			
		});
	},
	
	translateType: function(type) {
		return type;
	},

	getFieldsByJPath: function() {
		return this.jpathIndexation;
	},
	
	getTitle: function(dom) {
		
		var title = new BI.Title();
		var titleDom = dom.children('title');
		var icon = titleDom.attr('icon');

		titleDom.children('label').children().each(function() {
			var lang = this.nodeName;
			var val = $(this).text();
			title.setLabel(val, lang);
		});
		
		title.setIcon(icon);
		return title;
	}
}