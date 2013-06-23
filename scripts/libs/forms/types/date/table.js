define(['./default'], function(FieldDefault) {

	var field = function(main) {
		this.main = main;
	}

	field.prototype = $.extend({}, FieldDefault, {

		buildHtml: function() {},
		initHtml: function() {

			var field = this;
			this.fillExpander();
			this._dateInstance = this.main.domExpander.find('.bi-formfield-datetime-picker').datepicker({
				onSelect: function() {
					try {
						field._hasChanged();
					} catch(e) {
						console.log(e);
					}
				}
			}).bind('click', function(e) {
				e.stopPropagation();
			});		
		},

		setText: function(index, value) {
			this.divs[index].html(value);
		},

		addField: function(position) {

			this._loadedCallback = [];
			var inst = this;
			var div = $("<div></div>");
			this.divs.splice(position, 0, div)
			return { field: div, html: div, index: position };
		},

		removeField: function(position) {
			this.divs.splice(position, 1)[0].remove();
		}

		startEditing: function(position) {
			this.currentIndex = position;
			this.main.toggleExpander(position);
		},

		stopEditing: function(position) {
			this.main.hideExpander();
		},

		expanderShowed: function(index) {}
	});

	return field;
});