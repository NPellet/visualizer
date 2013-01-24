var BI = BI || {};
BI.Forms = {};
BI.Forms.Fields = {};

BI.Forms.Form = function(options, callback) {
	
	this.name = '_rootform';
	BI.Forms.Form.prototype.lastFormId++;
	this.formId = BI.Forms.Form.prototype.lastFormId;
	this.title;
	this.sections = [], this.absSections = [];
	this.fields = [];
	this.options = $.extend(true, {}, BI.Forms.Form.prototype.defaults, options);
	this.options.templater = new BI.Forms.Templaters[this.options.templater]();

	if(this.options.xmlFile) {
		var form = this;
		
		$.get(this.options.xmlFile, {}, function(data) {			
			var builder = new BI.Forms.xmlBuilder(form);
			builder.build($(data).children());
			callback.call(form);
		});
	} else {
		if(callback)
			callback.call(this);
	}
	
	
	
	if(this.options.fillFile) {
		var form = this;
		
		$.get(this.options.fillFile, {}, function(data) {
			form.fillForm($(data).children());
		});
	}

}

BI.Forms.Form.prototype = {
	
	lastFormId: 0,
	
	defaults: {
		templater: 'std'
	},
	
	init: function(dom) {
		var html = this.buildHtml();
		$(dom).html(html);
		this.dom = $(dom);
		for(var i = 0; i < this.sections.length; i++)
			this.sections[i].afterInit();
	
		BI.Forms.Section.prototype.showControls(this);

	},

	getDom: function() {
		return this.dom;
	},
	
	buildHtml: function() {
		var html = $('<form />');
		html.append(this.options.templater.buildForm(this));
		
		if(this.buttonZone) 
			html.append(this.buttonZone.render());
			
		html.append('</form>');
		return html;
	},
	
	afterInit: function() {
		//var inst = this;
	/*	this.dom.find('.bi-form-buttonzone').on('click', 'div', function(event) {
			event.preventDefault();
			inst.buttonZone.getButton($(this).data('id')).doClick();
		});*/
	},
	
	getId: function() { return this.formId; },
	
	/**
	 * Content function
	 */
	commitContent: function() {
		for(var i = 0; i < this.sections.length; i++) 
			this.sections[i].commitContent(this.formContent);
	},
	
	
	/**
	 * Structure function
	 */
	commitStructure: function() {
		for(var i = 0; i < this.sections.length; i++) 
			this.sections[i].commitStructure(this.formContent);
	},
	
	reloadStructure: function() {
	/*	var form = this.formDom.serialize();
		$.post(this.options.urlStructure, form, function() {
			this.commitStructure(this.interpretStructure());
		});*/
	},
	
	
	
	/**
	 * Structure functions
	 */
	setTitle: function(title) {
		this.title = title;
	},
	
	getTitle: function() {
		if(typeof this.title == "undefined")
			return;
			
		return this.title.getLabel();
	},
	
	addToolbar: function(toolbar) {
		this.toolbars.push(toolbar);
	},
	
	addSection: function(section, index) {
		if(typeof index == "undefined")
			this.sections.push(section);
		else
			this.sections.splice(index + 1, 0, section);
		section.setForm(this);
		section.setId(this.sections.length - 1);
		section.setLevel(1);
		
		this.addAbsSection(section);
		
		this.renumberSections();
		BI.Forms.Section.prototype.showControls(this);

		return section;
	},
	
	addAbsSection: function(section) {
		
		this.absSections.push(section);
		section.setAbsId(this.absSections.length - 1);
	},
	
	renumberSections: function() {
		for(var i = 0; i < this.sections.length; i++)
			this.sections[i].setId(i);
	},
	
	getSection: function(id) {
		return this.sections[id];
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
		return this.options.templater;
	},
	
	fillForm: function(data) {
		BI.Forms.Section.prototype.fillSections(this, data.children('sections'));
	},
	
	fillJson: function(json) {
		BI.Forms.Section.prototype.fillSectionsJson(this, json);
	},
	
	getValue: function() {
		var value = {};
		
		for(var i = 0; i < this.sections.length; i++) {
			if(!value[this.sections[i].getName()])
				value[this.sections[i].getName()] = [];
				
			var sectionValue = {};
			value[this.sections[i].getName()].push(sectionValue);
			BI.Forms.Section.prototype.getValue(this.sections[i], sectionValue);
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
			
			BI.Forms.Section.prototype.getValueFull(this.sections[i], sectionValue);
		}
		
		return value;
		
	},
	
	addButtonZone: function() {
		this.buttonZone = new BI.Buttons.Zone();
		this.buttonZone.setAlignment('right');
		return this.buttonZone;
	}
};


(function($) {
	
	$.fn.biForm = function(options, onLoad, afterInit) {
		return this.each(function() {
			var dom = this;

			function callback(form) {
				if(typeof onLoad == "function")
					onLoad.call(form);

				form.init(dom);
				form.afterInit();
				if(typeof afterInit == "function")
					afterInit.call(form);
				form.getTemplater().afterInit();
			}

			if(options instanceof BI.Forms.Form) {
				callback(options);
			} else {
				var form = new BI.Forms.Form(options, function() {
					callback(this);
				});
			}
		});
	}
	
}) (jQuery);
