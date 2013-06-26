define(['./default'], function(FieldDefault) {

	var field = function(main) {
		
		this.main = main;
		this.treeLoaded = false;
		this.divs = [];	
		this.optionsIndexed = [];
		this.options = {};
		this._loadedCallback = [];
	}

	field.prototype = $.extend({}, FieldDefault, {

		initHtml: function() {
		
			var field = this;
			// Change the input value will change the input hidden value
			var input = this.main.dom.on('click', 'div.bi-formfield-field-container > div', function(event) {
				event.stopPropagation();
				field.main.toggleExpander($(this).index());
			});
			
			
			this.placeholder = this.main.dom.on('click', '.bi-formfield-placeholder-container > label', function(event) {
				event.stopPropagation();
				var index = $(this).index();
				field.main.fieldContainer.children().eq(index).trigger('click');
			});
			
			this.main.dom.on('click', '.bi-formfield-image-container > img', function(event) {
				event.stopPropagation();
				var index = $(this).index();
				field.main.fieldContainer.children().eq(index).trigger('click');
			});
			
			this.loadTree();
		},
		
		setText: function(index, text) {
			
			if(!this.main.fields[index])
				return;

			this.main.fields[index].field.html(text);
		},
		
		expanderShowed: function(index) {
			this.fillTree(index);
		}
	});

	return field;
});
