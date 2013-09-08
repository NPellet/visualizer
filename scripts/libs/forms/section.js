define(['jquery', 'forms/grouplist', 'forms/grouptable', 'forms/title'], function($, grouplist, grouptable, Title) {

	var defaults = {
		multiple: false,
		visible: true
	};

	var section = function(name, options, title) {
		this.name = name;
		this.form;
		this.sectionId, 
		this.sectionAbsId,
		this.title,	
		this.fieldGroups = [];
		this.sections = [];
		this.options = $.extend(true, {}, defaults, options);
		this.fieldNames = [];
		if(title)
			this.setTitle(title);

		if(this.options.title)
			this.setTitle(this.options.title);
	}

	var prototype = {
			
		setForm: function(form) { this.form = form; },
		getForm: function() {
			return this.form || this.getParentSection().getForm();
		},
		
		setId: function(id) {
			this.sectionId = id;
			if(this.dom) {
				this.dom.attr('data-section-id', id);
				this.dom.data('section-id', id);
			}
		},
		
		getId: function() { return this.sectionId; },
		setAbsId: function(id) { this.sectionAbsId = id; },
		getAbsId: function() { return this.sectionAbsId; },
		setTitle: function(_title) {
			if(!(_title instanceof Title))
				_title = new Title(_title);
			this.title = _title;
		},
		
		getTitle: function() { return this.title ? this.title.getLabel() : ''; },

		buildHtml: function() {
			return this.getForm().getTemplater().buildSection(this, this.getLevel());
		},

		setStructure: function(structure) {
			var _section, group;
			if(structure.sections)
				for(var i in structure.sections) {
					_section = new section(i, structure.sections[i].config);
					this.addSection(_section);
					_section.setStructure(structure.sections[i]);
				}

			if(structure.groups)
				for(var i in structure.groups) {
					if(structure.groups[i].config.type == 'list')
						group = new grouplist(i);
					else
						group = new grouptable(i);

					this.addFieldGroup(group);
					group.setStructure(structure.groups[i]);
				}
		},

		afterInit: function() {
			
			var section = this;
		
			this.dom = this.getForm().dom.find('[data-section-absid="' + this.getAbsId() + '"]');
			this.domContent = this.dom.find('.bi-form-section-content');
			
			var header = this.dom.children('.bi-form-section-header');
			
			this.controlShowHide = header.find('.bi-form-section-show');
			this.controlUp = header.find('.bi-form-section-up');
			this.controlDown = header.find('.bi-form-section-down');
			this.controlDuplicate = header.find('.bi-form-section-add');
			this.controlRemove = header.find('.bi-form-section-remove');
			
			this.controlShowHide.bind('click', function() {
				if(section.options.visible) {
					section.options.visible = false;
					section.domContent.hide();

					header.removeClass('expanded');

					$(this).children().removeClass('triangle-down').addClass('triangle-right');
					section.showControls(section.getParent());
				} else {
					section.options.visible = true;
					section.domContent.show();

					header.addClass('expanded');

					$(this).children().removeClass('triangle-right').addClass('triangle-down');
					section.showControls(section.getParent());
				}
			});
			
			this.controlUp.bind('click', function() {
				if(section.sectionId == 0)
					return;
				section.dom.insertBefore(section.dom.prev());
				section.form.sections.splice(section.getId(), 1);
				section.form.sections.splice(section.getId() - 1, 0, section);
				
				section.form.renumberSections();
				
				section.showControls(section.getParent());
			});
			
			this.controlDown.bind('click', function() {
				
				if(section.sectionId == section.getForm().sections.length - 1) 
					return;
					
				section.dom.insertAfter(section.dom.next());
				section.form.sections.splice(section.getId(), 1);
				section.form.sections.splice(section.getId() + 1, 0, section);
				section.form.renumberSections();
				
				section.showControls(section.getParent());
			});
			
			this.controlDuplicate.bind('click', function() {
				
				section.duplicate(section.getParent());
			});
			
			this.controlRemove.bind('click', function() {
				if(section.getForm().sections.length == 0) 
					return;
				section.remove();
			});
			
				
			for(var i = 0; i < this.sections.length; i++)
				this.sections[i].afterInit();
		
			for(var i = 0; i < this.fieldGroups.length; i++)
				this.fieldGroups[i].afterInit();
				
			section.showControls(this);
		},
		
		getDom: function() { return this.dom; },

		show: function() {
			if(this.dom)
				this.dom.show();
		},

		hide: function() {
			if(this.dom)
				this.dom.hide();
		},

		isVisible: function() { return this.options.visible },
		isHidde: function() { return !this.isVisible() },
		getLevel: function() { return this.level; },
		
		setLevel: function(lvl) { this.level = lvl; },
		
		getName: function() { return this.name; },
		
		showHideSubSection: function(sectionName, show) {
			for(var i = 0, l = this.sections.length; i < l; i++)
				if(this.sections[i].getName() == sectionName)
					this.sections[i][show ? 'show' : 'hide']();
		},


		addSection: function(section, index) {
			
			if(typeof index == "undefined")
				this.sections.push(section);
			else
				this.sections.splice(index + 1, 0, section);
			section.setParentSection(this);
			section.setLevel(this.getLevel() + 1);
			section.setForm(this.form);

			this.getForm().addAbsSection(section);
			this.renumberSections();

			return section;
		},
		
		renumberSections: function() {
			for(var i = 0; i < this.sections.length; i++)
				this.sections[i].setId(i);
		},
		
		getParentSection: function() { return this.parentSection || undefined; },
		setParentSection: function(section) { this.parentSection = section; },
		getParent: function() {
			return this.parentSection || this.form;
		},
		
		getSections: function() { return this.sections; },
		
		//
		// Field groups
		//

		addFieldGroup: function(fieldGroup) {
			this.fieldGroups.push(fieldGroup);
			fieldGroup.setSection(this);
			this.renumberFieldGroups();
			return fieldGroup;
		},
		
		getGroup: function(groupName) {
			
			for(var i = 0, l = this.fieldGroups.length; i < l; i++) {
				if(this.fieldGroups[i].getName() == groupName)
					return this.fieldGroups[i];
				
			}
		},

		getFieldGroups: function() {
			return this.fieldGroups;
		},
		
		addFieldName: function(fieldName) {
			if(typeof this.fieldNames[fieldName] == "undefined")
				this.fieldNames[fieldName] = 0;
			return this.fieldNames[fieldName]++;
		},
		
		
		renumberFieldGroups: function() {
			for(var i = 0; i < this.fieldGroups.length; i++)
				this.fieldGroups[i].setId(i);
		},
		
		duplicate: function(parent) {
			
			var section = this.duplicateStructure(parent);
			var html = this.getForm().getTemplater().buildSection(section, this.getLevel());
			this.dom.after(html);
			section.afterInit();
			this.showControls(this.getParent());

			return section;
		},
		
		duplicateStructure: function(parent) {
			
			var section = new section(this.getName(), this.options);
			section.setTitle(this.getTitle().duplicate());
			parent.addSection(section, this.getId());
			
			for(var i = 0; i < this.fieldGroups.length; i++)
				this.fieldGroups[i].duplicate(section);
			
			for(var i = 0; i < this.sections.length; i++)
				this.sections[i].duplicateStructure(section);
				
			return section;
		},
		
		remove: function() {
			for(var i = 0; i < this.fieldGroups.length; i++)
				this.fieldGroups[i].remove();
			for(var i = 0; i < this.sections.length; i++)
				this.sections[i].remove();
			this.dom.remove();
			if(this.parentSection)
				this.parentSection.removeSection(this);
			else
				this.getForm().removeSection(this);
			this.showControls(this.getParent());
		},

		removeSection: function(section) {
			this.sections[section.getId()] = null;
			this.sections.splice(section.getId(), 1);
			this.renumberSections();
		},
		
		removeFieldGroup: function(group) {
			this.fieldGroups[group.getId()] = null;
			this.fieldGroups.splice(group.getId(), 1);
			this.renumberFieldGroups();
		},
		
		/** Static functions */
		showControls: function(el) {
			
			var names = [];
			for(var i = 0; i < el.sections.length; i++) {
				if(names[el.sections[i].getName()] == undefined)
					names[el.sections[i].getName()] = 0;
				names[el.sections[i].getName()]++;
			}
			
			
			for(var i = 0; i < el.sections.length; i++) {
				
				var section = el.sections[i];
				
				if(!section.dom)
					continue;
				
				var head = section.dom.children('.bi-form-section-header');
				head.find('span').show();
				
				
				if(!section.options.multiple)
					head.find('span.bi-form-section-add').hide();

				if(!section.options.multiple || i == 0 || el.sections[i - 1].getName() != section.getName())
					head.find('span.bi-form-section-up').hide();
				
				if(!section.options.multiple || names[section.getName()] == 1)
					head.find('span.bi-form-section-remove').hide();
				
				if(!section.options.multiple || i == el.sections.length - 1 || el.sections[i + 1].getName() != section.getName())
					head.find('span.bi-form-section-down').hide();
			}
					
		},
		
		fillSectionsXML: function(parent, parentXML) {
			
			var sectionsByName = [];
			for(var i = 0; i < parent.sections.length; i++) {
				var name = parent.sections[i].getName();
				if(sectionsByName[name] == undefined)
					sectionsByName[name] = [];
				sectionsByName[name].push(parent.sections[i]);
			}
			
			var lastSection;
			parentXML.children('section').each(function() {
				var sectionName = $(this).attr('name');
				
				if(sectionsByName[sectionName].length > 0) {
					var section = sectionsByName[sectionName].shift();
					lastSection = section;
				} else {
					var section = lastSection.duplicate(parent);
				}
				
				var sectionsXML;
				if((sectionsXML = $(this).children('sections')).length > 0)
					prototype.fillSections(section, sectionsXML);
					
					
				if(section.fieldGroups) {
					var groupsByName = [];
					for(var i = 0; i < section.fieldGroups.length; i++) {
						var name = section.fieldGroups[i].getName();
						if(groupsByName[name] == undefined)
							groupsByName[name] = [];
						groupsByName[name].push(section.fieldGroups[i]);
					}
					
					var groupsXML;
					var lastGroup;
					
					if((groupsXML = $(this).children('fields').children()).length > 0) {
						groupsXML.each(function() {
							
							var groupName = $(this).attr('name');
							if(groupsByName[groupName].length > 0) {
								var group = groupsByName[groupName].shift();
								lastGroup = group;
							} else
								var group = lastGroup.duplicate(parent);
							
							switch(this.nodeName) {
								case 'list':
									grouplist.prototype.fill(group, $(this));	
								break;
							}
						});
					}
				}
			});
		},
		
		empty: function(section) {

			for(var i = 0, l = section.sections.length; i < l; i++) {
				section.sections[i].empty();
			}

			for(var i = 0, l = section.groupsFields.length; i < l; i++) {
				section.groupsFields[i].empty();
			}
		},


		fillSectionsJson: function(parent, jsonObject) {
			
			var sectionsByName = this.getSectionsByName(parent);
			
			var lastSection;
			if(!jsonObject)
				return;
			
			for(var i in jsonObject.sections) {
				var sectionName = i;
				for(var j = 0; j < jsonObject.sections[i].length; j++) {
					if(!sectionsByName[sectionName])
						continue;
					else if(sectionsByName[sectionName].length > 0) {
						var section = sectionsByName[sectionName].shift();
						lastSection = section;
					} else {
						var section = lastSection.duplicate(parent);
					}
					this.fillSectionsJson(section, jsonObject.sections[i][j]);
				}
			}
			
			if(parent.fieldGroups && jsonObject.groups) {
				var groupsByName = this.getGroupsByName(parent);
				var lastGroup;
				
				for(var k in jsonObject.groups) {
					
					var groupName = k;
					for(var l = 0; l < jsonObject.groups[k].length; l++) {
					
						if(groupsByName[groupName] && groupsByName[groupName].length > 0) {
							var group = groupsByName[groupName].shift();
							lastGroup = group;
						} else
							var group = lastGroup.duplicate(parent);
					
						group.fillJson(jsonObject.groups[k][l]);
					}
				}
			}
		},
		
		getSectionsByName: function(parent) {
			
			var sectionsByName = [];
			for(var i = 0; i < parent.sections.length; i++) {
				var name = parent.sections[i].getName();
				if(sectionsByName[name] == undefined)
					sectionsByName[name] = [];
				sectionsByName[name].push(parent.sections[i]);
			}
			
			return sectionsByName;
		},
		
		getGroupsByName: function(section) {
			var groupsByName = [];
			for(var i = 0; i < section.fieldGroups.length; i++) {
				var name = section.fieldGroups[i].getName();
				if(groupsByName[name] == undefined)
					groupsByName[name] = [];
				groupsByName[name].push(section.fieldGroups[i]);
			}
			
			return groupsByName;
		},
		
		getValue: function(section, values) {
			
			for(var i = 0; i < section.sections.length; i++) {
			
				if(values[section.sections[i].getName()] == undefined)
					values[section.sections[i].getName()] = [];
				var value = {};
				values[section.sections[i].getName()].push(value);
				prototype.getValue(section.sections[i], value);
			
			}
			
			if(section.fieldGroups) {
			
				for(var i = 0; i < section.fieldGroups.length; i++) {
					if(values[section.fieldGroups[i].getName()] == undefined)
						values[section.fieldGroups[i].getName()] = [];
					var value = [];
					values[section.fieldGroups[i].getName()].push(value);
					section.fieldGroups[i].getValue(value);
				}
			}
		},
		
		
		getValueFull: function(section, values) {
			
			values.sections = {};
			values.groups = {};
			
			for(var i = 0; i < section.sections.length; i++) {
				if(values.sections[section.sections[i].getName()] == undefined)
					values.sections[section.sections[i].getName()] = [];
				var value = {};
				values.sections[section.sections[i].getName()].push(value);
				prototype.getValueFull(section.sections[i], value);
			}
			
			if(section.fieldGroups) {
				for(var i = 0; i < section.fieldGroups.length; i++) {
					if(values.groups[section.fieldGroups[i].getName()] == undefined)
						values.groups[section.fieldGroups[i].getName()] = [];
					var value = {};
					values.groups[section.fieldGroups[i].getName()].push(value);
					section.fieldGroups[i].getValueFull(value);
				}
			}
		}
	}

	section.prototype = prototype;

	return section;
});