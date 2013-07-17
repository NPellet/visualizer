define(['jquery', 'forms/field'], function($, fieldPrototype) {

	var field = function(options, group) {
		this.init(options);
		
		var type = this.options.type, self = this;
		self.deferred = $.Deferred();
		
		require(['forms/types/' + type.toLowerCase() + '/table'], function(FieldImplement) {
			self.implementation = new FieldImplement(self);
			self.getGroup().getSection().getForm().fieldReady(self.fieldIdAbs);
			self.deferred.resolve();
		});

		this.setGroup(group);
		this.getGroup().getSection().getForm().fieldNotReady(self.fieldIdAbs);

		if(this.options.title)
			this.setTitle(this.options.title);
	}

	field.prototype = $.extend({}, fieldPrototype, {
		buildHtml: function() {
			return '';
		},

		afterInit: function(tableWrapper) {
			var field = this;
			this.isInit = true;
			this.dom = $("#bi-formfield-" + this.fieldIdAbs);
			this.inputContainer = $("<div />").appendTo(tableWrapper);
			this.domExpander = $('<div class="bi-formfield-expand" />').data('field', this).appendTo(tableWrapper).hide();
			
			this.implementation.initHtml();
			this.renumberInputs();

			return this.dom;
		},

		showExpander: function(index) {

			// Hide the expander (unbind the document event before binding it again)
			this.hideExpander(true);
			
			// Bind event
			$(document).bind('click', this.handlerHideExpander);
			
			if(typeof this.implementation.expanderShowed == "function")
				this.implementation.expanderShowed(index);
			
			var input = this.fields[index].field.addClass('bi-expanded');
			var pos = input.position();
			var width = input.innerWidth();
			var height = input.innerHeight();
			
			this.expandedIndex = index;
			this.domExpander.css({top: pos.top + height, width: width}).slideDown(100);
			//this.group.stopEditing();
			this.domExpander.show().css({
				width: this.group.fieldsWidth + 1,
				marginLeft: 0
			});
		}
	});

	return field;
});