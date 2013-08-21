define(['require', 'jquery', 'forms/section', 'forms/title', 'forms/buttonzone'], function(require, $, Section, Title, ButtonZone) {
	
	var id = 0;
	$.extend($.support, {
		fileReader: !!(typeof FileReader),
		formData: !!(typeof FormData),
		drop: "ondrop" in document
	});

	var defaults = {
		templater: 'std',
		labels: true
	};

	var form = function(options, onloaded) {
		var self = this;
		var xmlLoaded, builderLoaded, fillerLoaded;

		this.name = '_rootform';
		this.formId = ++id;
		this.title;
		this.sections = [], this.absSections = [];
		this.fields = [];
		this.options = $.extend(true, {}, defaults, options);
		this.ready = $.Deferred(), this.notReady = 0;

		var templaterLoaded = $.Deferred(), loaded = $.Deferred();
		

		require(['forms/templater/' + this.options.templater], function(FormTemplater) {
			self.templater = new FormTemplater();
			templaterLoaded.resolve();
			self.setLabels(self.options.labels == undefined ? true : self.options.labels);
		});
		
		if(this.options.xmlFile) {
			
			xmlLoaded = $.Deferred(), builderLoaded = $.Deferred();

			require(['forms/xmlbuilder'], function(XMLBuilder) {
				builderLoaded.resolve(XMLBuilder);
			});

			$.get(this.options.xmlFile, {}, function(data) {
				xmlLoaded.resolve($(data).children());
			});

			$.when(builderLoaded, xmlLoaded).then(function(builder, xml) {
				builder = new builder(self);
				builder.build(xml);
			});

			if(this.options.fillFile) {
				fillerLoaded = $.Deferred();

				$.get(this.options.fillFile, {}, function(data) {
					form.fillForm($(data).children());
					fillerLoaded.resolve();
				});
			} else
				fillerLoaded = true;
			

		} else {
			builderLoaded = true;
			xmlLoaded = true;
			fillerLoaded = true;
		}

		$.when(templaterLoaded, builderLoaded, xmlLoaded, fillerLoaded).then(function() {
			loaded.resolve();
		});

		this.loaded = loaded;
	}

	form.prototype = $.extend({}, Section.prototype, {

		onLoaded: function(callback) {

			return $.when(this.loaded, this.ready).then(callback);
		},

		afterInit: function() {
		
		},


		setLabels: function(bool) {
			this.templater.setLabels(bool);
		},

		fieldNotReady: function(fieldId) {
			this.notReady++;
			
		},

		fieldReady: function(fieldId) {
			this.notReady--;
			if(this.notReady == 0)
				this.ready.resolve();
		},

		showFieldLabels: function(bool) {
			this.templater.showFieldLabelsLabels(bool);
		},

		getDom: function() { return this.dom; },
		getId: function() { return this.formId; },

		init: function(dom) {
			var html = $('<form />');
			this.dom = $(dom);
			html.append(this.templater.buildForm(this));
			html.append('</form>');
			this.dom.html(html);
			for(var i = 0; i < this.sections.length; i++)
				this.sections[i].afterInit();
			this.showControls(this);
		},

		setStructure: function(structure) {
			
			var section, defs = [];
			for(var i in structure.sections) {
				section = new Section(i, structure.sections[i].config);
				this.addSection(section);
				section.setStructure(structure.sections[i]);
			}
		},

		setTitle: function(_title) { 
			if(!(_title instanceof Title))
				_title = new Title(title);
			this.title = _title; 
		},

		getTitle: function() {
			return this.title ? this.title.getLabel() : '';
		},

		/*addToolbar: function(toolbar) {
			this.toolbars.push(toolbar);
		},*/

		addSection: function(section, index) {
			if(index == undefined)
				this.sections.push(section);
			else
				this.sections.splice(index + 1, 0, section);
			section.setForm(this);
			section.setLevel(1);
			this.addAbsSection(section);
			this.renumberSections();
			Section.prototype.showControls(this);

			return section;
		},
		
		addAbsSection: function(section) {
			
			this.absSections.push(section);
			section.setAbsId(this.absSections.length - 1);
		},
	
		getSection: function(id) {
			if(this.sections[id])
				return this.sections[id];

			for(var i in this.sections) {
				if(this.sections[i].getName() == id)
					return this.sections[i];
			}
		},
		
		addField: function(field) {
			this.fields.push(field);
		},
		
		getSections: function() {
			return this.sections;
		},
		
		removeSection: function(section) {
			this.sections[section.getId()] = null;
			this.sections.splice(section.getId(), 1);
			this.renumberSections();
		},
		
		getTemplater: function() {
			return this.templater;
		},
		
		fillForm: function(data) {
			Section.prototype.fillSections(this, data.children('sections'));
		},
		
		fillJson: function(json) {
			Section.prototype.fillSectionsJson(this, json);
		},

		empty: function() {
			Section.prototype.emptySection(this);
		},
		
		getValue: function() {
			var value = {};
			
			for(var i = 0; i < this.sections.length; i++) {
				if(!value[this.sections[i].getName()])
					value[this.sections[i].getName()] = [];
					
				var sectionValue = {};
				value[this.sections[i].getName()].push(sectionValue);
				Section.prototype.getValue(this.sections[i], sectionValue);
			}
			
			return value;
		},
		
		getValueFull: function() {
			var value = {sections: {}, groups: {}};
			
			for(var i = 0; i < this.sections.length; i++) {
				
				if(!value.sections[this.sections[i].getName()])
					value.sections[this.sections[i].getName()] = [];
					
				var sectionValue = {};
				value.sections[this.sections[i].getName()].push(sectionValue);
				
				Section.prototype.getValueFull(this.sections[i], sectionValue);
			}
			
			return value;
			
		},
		
		addButtonZone: function() {
			this.buttonZone = new ButtonZone();
			this.buttonZone.setAlignment('right');

			for(var i = 0, l = arguments.length; i < l; i++)
				this.buttonZone.addButton(arguments[i]);
			
			if(this.dom)
				this.dom.children().append(this.buttonZone.render());

			return this.buttonZone;
		},

		onFieldChange: function(jpath, value, index) {
			if(this.options.onFieldChange)
				this.options.onFieldChange(jpath, value, index);
		}
	});

	return form;
});
