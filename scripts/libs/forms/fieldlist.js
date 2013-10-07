define(['jquery', 'forms/field'], function($, fieldPrototype) {

	var field = function(options, group) {
		this.init(options);
		var type = this.options.type, self = this;
		self.deferred = $.Deferred();
	
	if(type == undefined)
		console.trace();
	
		require(['forms/types/' + type.toLowerCase() + '/list'], function(FieldImplement) {
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
			var html = [];
			html.push('<div id="bi-formfield-');
			html.push(this.fieldIdAbs);
			html.push('" class="bi-formfield-element bi-formfield-type-');
			html.push(this.options.type.toLowerCase());
			html.push('">');
			html.push('<div class="bi-formfield-vals"></div>');

			html.push(this.implementation.buildHtml());
			html.push('<div class="bi-formfield-expand"></div>')
			html.push('</div>');
			return html.join('');
		},

		afterInit: function() {

			var field = this;
			this.isInit = true;
			this.dom = $("#bi-formfield-" + this.fieldIdAbs);
			this.inputContainer = this.dom.children('.bi-formfield-vals');
			this.fieldContainer = this.dom.children('.bi-formfield-field-container');
			
			this.domExpander = this.dom.find('.bi-formfield-expand').data('field', this);
			this.implementation.initHtml();
			
			this.fieldContainer.on('click', '.bi-formfield-duplicate > span', function() {
				var index = $(this).parent().parent().index();
				if($(this).hasClass('bi-formfield-add'))
					field.addField(index);
				else
					field.removeField(index);
				field.doDuplicateRefresh();
			});
			
			
			this.addField();
			this.renumberInputs();
			this.doDuplicateRefresh();
			return this.dom;
		},

		doDuplicateRefresh: function() {

			var add = '<span class="bi-formfield-add">+</span>';
			var remove = '<span class="bi-formfield-remove">-</span>';
			
			for(var i = 0; i < this.fields.length; i++) {
				if(!this.fields[i].duplicater)
					continue;
				this.fields[i].duplicater.empty();
				if(!this.options.multiple)
					continue;
				this.fields[i].duplicater.append(this.fields.length == 1 ? '' : remove).append(add);
			}
		}
	});

	return field;
});
