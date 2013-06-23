define(['forms/fielddefault'], function(Default) {

	return $.extend({}, Default, {

		buildHtml: function() {
			var html = [];
			html.push('<div class="bi-formfield-placeholder-container"></div>');
			html.push('<div class="bi-formfield-image-container"></div>');
			html.push('<div class="bi-formfield-duplicate-container"></div>')
			html.push('<div class="bi-formfield-field-container"></div>');
			return html.join('');
		},
	
			
		initHtml: function() {
			
			
			var field = this;
			// Change the input value will change the input hidden value
			var input = this.main.dom.on('click', 'div.bi-formfield-field-container > div', function(event) {
				event.stopPropagation();
				field.setValue($(this).index());
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
			
			this.fillExpander();
			
			
			this._dateInstance = this.main.domExpander.find('.bi-formfield-datetime-picker').datepicker({
				onSelect: function() {
					field._hasChanged();
				}
			}).bind('click', function(e) {
				e.stopPropagation();
			});
			
		},
		
		_hasChanged: function() {
			
			var field = this;
			var index = this.main.findExpandedElement().index;
			var date = this._dateInstance.datepicker('getDate');
			this.main.changeValue(index, date.getTime());
			this._setValueText(index, date);
		},
		
		setValue: function(index, timestamp) {

			var date = new Date();
			if(!(timestamp == undefined || timestamp == null || timestamp == 0))
				date.setTime(timestamp);
			else
				return;
			
			
			this._setValueText(index, date);
			this.main.changeValue(index, timestamp);
			//this._dateInstance.datepicker('setDate', date);	
		},
		
		_addZero: function(val) {
			if((val + "").length == 1)
				return "0" + val;
			return val;
		},
		
		_setValueText: function(index, date) {
			BI.lang = {};
			BI.lang.months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
			var str = this._addZero(date.getDate()) + " " + BI.lang.months[date.getMonth()] + " " + date.getFullYear();
			this.main.fields[index].field.html(str);		
		},
		
		fillExpander: function() {
			
			var html = [];
			html.push('<div class="bi-formfield-datetime-picker"></div>');
			html.push('<div class="bi-spacer"></div>');
			
			this.main.domExpander.html(html.join(''));	
			
		}
	});
});