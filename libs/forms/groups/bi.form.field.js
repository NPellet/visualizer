
BI.Forms.Field = function(options) {
	this.init(options);
}

BI.Forms.Field.prototype = {
	
	init: function(options, implementationLocation) {
		
		this.options = $.extend(true, {}, BI.Forms.Field.prototype.defaults, options);
		this.fieldIdAbs = BI.Forms.Field.prototype.fieldIdAbs;
		BI.Forms.Field.prototype.fieldIdAbs++;
		this.isValid = [];
		this.values = [];
		this.fields = [];
		this.isInit;
		this.groupId;
		
		this.changeHandler = [];
		this.styledElement, this.valInput, this.placeHolderElement;
		
		if(!this.options.reloadStructure instanceof Array)
			this.options.reloadStructure = [this.options.reloadStructure];
		
		
		this.implementationLocation = implementationLocation;
		
		if(this.options.type) {
			var implementationName = this.options.type;
			if(typeof BI.Forms.Fields[implementationName] == "undefined") {
				throw "Error. No implementation for the type \"" + implementationName + "\" has been loaded";
				return;
			}
			
			this.implementation = new BI.Forms.Fields[implementationLocation][implementationName](this);
		}
		
	},
	
	fieldIdAbs: 0,
	
	defaults: {
		name: null,
		
		placeholder: null,
		
		notnull: false,
		pattern: false,
		multiple: false,
		
		reloadStructure: 'never' 
		/*
		 * Possible values:
		 * 	- never: 	Never reload the form structure
		 * 	- change:	Field's value is changed
		 * 	- getsNull:	Field gets null
		 * 	- getsNotNull:	Field gets not null
		 * 	- isError:	Fields get in error
		 * 	- isNotError:	Fields was in error but now is ok
		 * 	- duplicate:	Fields is duplicated
		 * 	- removed:	Fields is removed
		 */
		
	},
	
	setGroupId: function(id) {
		this.groupId = id;
	},
	
	getGroupId: function() {
		return this.groupId;
	},
	
	setTitle: function(title) {
		this.title = title;
	},
	
	getTitle: function() {
		if(typeof this.title == "undefined")
			return new window[window._namespaces['title']].Title('');
		return this.title;
	},
	
	getName: function() {
		return this.options.name;
	},
	
	getFieldName: function(fieldId) {
		return [this.getName(), "#", this.section.getId(), ".", fieldId].join('');
	},
	
	getFieldId: function() {
		return this.fieldIdAbs;
	},
	
	getValue: function(index) {
		return this.values[index];		
	},
	
	fillValue: function(valueStack) {
		var length = this.values.length;
		for(var i = 0; i < length; i++)
			valueStack.push(this.values[i]);
	},
	
	setValue: function(index, value) {
		this.values[index] = value;
	},
		
	resetDuplicate: function() {
		var length = this.values.length;
		for(var i = 1; i < length - 1; i++)
			this.removeField();
	},
	
	
	setGroup: function(group) {
		this.group = group;
		this.setSection(group.getSection());
		this.form = this.section.getForm();
		this.form.addField(this);
	},
	
	setSection: function(section) {
		this.section = section;
	},
	
	doDuplicateRefresh: function() {
		
		var add = '<span class="bi-formfield-add">+</span>';
		var remove = '<span class="bi-formfield-remove">-</span>';
		
		for(var i = 0; i < this.fields.length; i++) {
			this.fields[i].duplicater.empty();
			if(!this.options.multiple)
				continue;
			this.fields[i].duplicater.append(this.fields.length == 1 ? '' : remove).append(add);
		}
	},
	
	renumberInputs: function() {
		
		var field = this;
		this.inputContainer.children().each(function(i) {
			$(this).attr('name', field.getFieldName(i));
			/* Sets up the val variable */
			field.values[i] = $(this).val();
			field.fields[i].index = i;
		});
	},
	
	/**
	 * This part is specific to each field element
	 */
	addField: function(position) {
		/* Gets the field position from the implementation */
		var field = this.implementation.addField(position);
		/* inits the field */
		if(field.index == 0)
			field.index = this.fields.length;
		
		this.fields.splice(field.index, 0, field);
		this.values.splice(field.index, 0, "");
		var input = $('<input type="hidden" />');
		field.input = input;
		if(field.index == 0)
			this.inputContainer.append(input);
		else
			this.inputContainer.children().eq(field.index - 1).after(input);
		this.renumberInputs();
		this.initField(field.index);
		return field;
	},
	
	removeField: function(index) {
		this.implementation.removeField(index);
		this.values.splice(index, 1);
		
		if(this.fields[index].wrapper)
			this.fields[index].wrapper.remove();
			
		if(this.fields[index].input)
			this.fields[index].input.remove();
			
		this.fields.splice(index, 1);
		this.renumberInputs();
		
	},
	
	initField: function(index) {
		/* Sets the placeholder val */
		
		if(typeof this.implementation.setPlaceholder == "function")
			this.implementation.setPlaceholder(index);
		else if (this.fields[index].placeholder)
			this.fields[index].placeholder.html(this.options.placeholder);
		
		if(typeof this.implementation.setImage == "function")
			this.implementation.setImage(index);
		else if(this.fields[index].image)
			this.fields[index].image.attr('src', this.title.getIconUrl());		
	},
	
	/**
	 * When the value of the "index"-th field is changed
	 */
	changeValue: function(index, value, commitToView) {
		
		if(!value)
			return;
			
		if(!this.isInit)
			return;
		
		// Change the value of the input hidden
		this.fields[index].input.val(value);
		
		// Choose to hide or display the placeholder and index "index"
		this.togglePlaceholder(((value + "").length > 0 ? false : true), index);
		
		// Check the validation at index "index"
		if(this.checkValidation(index) || 1==1) {
			this.setValue(index, value);
		};
		
		// Check if any action towards field structure is necessary
		// i.e. if the null state of the field has changed
		if(value.length == 0 && this.values[index].length > 0)
			this.doReloadStructure('getsNull');
		else if(value.length > 0 && this.values[index].length == 0)
			this.doReloadStructure('getsNotNull');
		
		this.doReloadStructure('change');
		for(var i = 0; i < this.changeHandler.length; i++)
			this.changeHandler[i].call(this, index, value);
	},
	
	isValid: function() {
		return this.isValid;
	},
	
	checkValidation: function() {
		
		var isValid = this.doCheckValidation();
		if(isValid && !this.isValid) {
			this.removeError();
			this.doReloadStructure('isNotError');
		} else if(!isValid && this.isValid) {
			this.showError();
			this.doReloadStructure('isError');
		}
		
		this.isValid = isValid;
	},
	
	setValidState: function(index, state) {
		
		return;
		if(this.isValid[index] && !state) {
			this.hideError(index);
		} else if(!this.isValid[index] && state) {
			this.showError(index);
		}
		this.isValid[index] = state;
	},
	
	showError: function() {
		if(typeof this.implementation.showError == "function")
			return this.implementation.showError();
			
		if(!this.isInit)
			return;
		
		return;	
		this.styledElement.addClass('bi-error');
	},
	
	hideError: function() {
		if(typeof this.implementation.hideError == "function")
			return this.implementation.hideError();
			
		if(!this.isInitiated)
			return;
			
		this.styledElement.remove('bi-error');
	},
	
	togglePlaceholder: function(show, index) {
		if(typeof this.implementation.togglePlaceholder == "function")
			this.implementation.togglePlaceholder(index, show);
		else
			try {
				if(this.fields[index].placeholder)
					this.fields[index].placeholder.animate({opacity: (show ? 0.4 : 0)}, 250);
			} catch(e) {
				BI.logError("Could not animate placeholder", e);
			}
	},
	
	toggleExpander: function(index) {
	
		var input = this.fields[index].field;
		if(input && input.hasClass('bi-expanded'))
			this.hideExpander();
		else
			this.showExpander(index);
	},
	
	showExpander: function(index) {
		
		// Hide the expander (unbind the document event before binding it again)
		this.hideExpander(false);
		
		// Bind event
		$(document).bind('click', this.handlerHideExpander);
		
		if(this.fields[index].duplicater)
			this.fields[index].duplicater.animate({ opacity: 0 });
		
		var input = this.fields[index].field.addClass('bi-expanded');
		var pos = input.position();
		var width = input.innerWidth();
		var height = input.innerHeight();
		
		this.expandedIndex = index;
		
		if(typeof this.implementation.expanderShowed == "function")
			this.implementation.expanderShowed(index);
		
		this.domExpander.css({top: pos.top + height, width: width}).slideDown(100);
	},
	
	hideExpander: function(doNotClose) {
		
		// Unbind event
		$(document).unbind('click', this.handlerHideExpander);
		
		// Finds the element hat is current expanded
		
		if((bound = $(".bi-formfield-expand:visible").data('field')) !== undefined) {
			
			if(bound == undefined)
				return;
			
			// Else, hide the expander
			var index = bound.expandedIndex;
			
			if(bound.fields[index].duplicater)
				bound.fields[index].duplicater.animate({ opacity: 1 });
			
			// Should we really close id ?
			if(!doNotClose)
				bound.domExpander.slideUp('fast', function() {
					bound.fields[index].field.removeClass('bi-expanded');
				});
			else // If not, just remove the bi-expanded class
				bound.fields[index].field.removeClass('bi-expanded');
		}
	},
	
	handlerHideExpander: function(event) {
		
		
		var expander;
		if((expander = $(event.target).parents('.bi-formfield-styled').andSelf().filter('.bi-formfield-styled, .dynatree-expander')).length == 1)
			return;
			
		var data;
		if((data = $(".bi-formfield-expand:visible").data('field')) !== undefined)
			data.hideExpander();
	},
	
	findExpandedElement: function() {
		
		var fields = this.form.fields;
		for(var i in fields) {
			
			for(var j in fields[i].fields) {
				
				var field = fields[i].fields[j];
				if(field.field)
					var fieldEl = field.field;
				else if(field.html)
					var fieldEl = field.html;
				
				if(fieldEl.hasClass('bi-expanded'))
					return field;
			}
		}
	},
	
	
	doCheckValidation: function() {
		
		var value = this.getValue();
		if(this.options.notnull && this.isNull())
			return false;
			
		if(this.options.pattern != false && !(new RegExp(this.options.pattern).test(value)))
			return false;
	},
	
	doReloadStructure: function(element) {
		
		if($.inArray(element, this.options.reloadStructure))
			this.form.reloadStructure();
	},
	
	duplicate: function(group) {
		
		//var field = new BI.Forms[this.implementationLocation].Field(this.options);
		
		var field = group.addField(this.options);
		field.setSection(group.getSection());
		
		for(var i = 0; i < this.values.length; i++) {
		
			field.setTitle(this.getTitle().duplicate());
			if(typeof this.implementation.options != "undefined")
			field.implementation.setOptions(this.implementation.options);
			field.setValue(i, this.values[i]);
		}
		
		return field;
	},
	
	remove: function() {
		this.dom.unbind().remove();
		this.group.removeField(this);
	},
	
	onChange: function(fct) {
		this.changeHandler.push(fct);
	}
}
