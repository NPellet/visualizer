define(['./default'], function(FieldDefault) {
	var field = function(main) {
		this.main = main;
	}
	field.prototype = $.extend({}, FieldDefault, {

		buildHtml: function() {},
		initHtml: function() {
			var field = this;
			this.fillExpander();
			this._inputHours = this.main.domExpander.find('.bi-formfield-timehours').bind('keyup', function() { field._hasChanged(); }).bind('click', function(e) { e.stopPropagation() });
			this._inputMinutes = this.main.domExpander.find('.bi-formfield-timeminutes').bind('keyup', function() { field._hasChanged(); }).bind('click', function(e) { e.stopPropagation() });
			this._inputSeconds = this.main.domExpander.find('.bi-formfield-timeseconds').bind('keyup', function() { field._hasChanged(); }).bind('click', function(e) { e.stopPropagation() });

			this._dateInstance = this.main.domExpander.find('.bi-formfield-datetime-picker').datepicker({
				onSelect: function() {
					field._hasChanged();
				}
			}).bind('click', function(e) {
				e.stopPropagation();
			});
			
			this._aidSeconds = this.main.domExpander.find('.aig.seconds');
			this._aidMinutes = this.main.domExpander.find('.aig.minutes');
			this._aidHours = this.main.domExpander.find('.aig.hours');
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
		},

		startEditing: function(position) {
			this.currentIndex = position;
			this.main.toggleExpander(position);
		},

		stopEditing: function(position) {
			this.main.hideExpander();
		}

		expanderShowed: function(index) {
			
			var date = this.main.getValue(index);
			
			var date = new Date(date);
			this._inputMinutes.val(this._addZero(date.getMinutes()));
			this._inputHours.val(this._addZero(date.getHours()));
			this._inputSeconds.val(this._addZero(date.getSeconds()));
			
			
			this.setExpanderValue(date, date.getHours(), date.getMinutes(), date.getSeconds());
		}
	});
	
	return field;
});
