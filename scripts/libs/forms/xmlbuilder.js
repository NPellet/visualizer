define(['jquery', 'form/section', 'form/title', 'form/grouplist', 'form/grouptable'], function($, Section, Title, GroupList, GroupTable) {

	var defaults = {
		onFieldChange: null,
		labels: true
	};

	function getTitle(dom) {
		var title = new Title(),
			subdom = dom.children('title'),
			icon = subdom.attr('icon');
		
		subdom.children('label').children().each(function() {
			title.setLabel(this.textContent, this.nodeName);
		});
		
		if(icon)
			title.setIcon(icon);
		return title;
	}


	var builer = function(form, options) {
		this.form = form || new BI.Forms.Form();
		this.jpathIndexation = [];
		this.options = $.extend({}, defaults, options)
		if(!this.options.labels)
			this.form.setLabels(false);
	}

	builder.prototype = {
		build: function(dom) {
				var title = getTitle(dom);
				this.form.setTitle(title);
				this.buildSection(this.form, dom);
				return this.form;
		},

		buildSection: function(parent, dom) {
			var inst = this;
			dom.children('sections').children().each(function() {
				var dom = $(this);
				var section = new Section(dom.attr('name'), {
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
						var groupfield = new GroupTable(name);
					break;

					default:
					case 'list':
						var groupfield = new GroupList(name);
					break;
				}
			
				section.addFieldGroup(groupfield);
				inst.buildFields(groupfield, domGroup);
			});
		},
	},
	
	buildFields: function(group, dom) {
		
		var inst = this;
		
		dom.children().each(function() {
			var domField = $(this),
				type = domField.attr('type'),
				jpath = domField.attr('jpath');
			var field = group.addField({
				type: type,
				multiple: domField.attr('multiple') == "multiple",
				name: domField.attr('name'),
				placeholder: ""
			});
			field.onChange(function(index, value) {
				if(inst.options.onFieldChange && jpath)
					inst.options.onFieldChange(jpath, value, index);
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
		});
	},
	
	getFieldsByJPath: function() {
		return this.jpathIndexation;
	}
});