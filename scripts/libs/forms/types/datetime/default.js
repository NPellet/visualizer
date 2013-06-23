define(['forms/fielddefault', 'util'], function(Default) {

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
			this._inputHours = this.main.domExpander.find('.bi-formfield-timehours').bind('keyup', function() { field._hasChanged(); }).bind('click', function(e) { e.stopPropagation() });
			this._inputMinutes = this.main.domExpander.find('.bi-formfield-timeminutes').bind('keyup', function() { field._hasChanged(); }).bind('click', function(e) { e.stopPropagation() });
			this._inputSeconds = this.main.domExpander.find('.bi-formfield-timeseconds').bind('keyup', function() { field._hasChanged(); }).bind('click', function(e) { e.stopPropagation() });
			this._dateInstance = this.main.domExpander.find('.bi-formfield-datetime-picker').datepicker({
				onSelect: function() {
					field._hasChanged();
				}
			});
			
			this._aidSeconds = this.main.domExpander.find('.aig.seconds');
			this._aidMinutes = this.main.domExpander.find('.aig.minutes');
			this._aidHours = this.main.domExpander.find('.aig.hours');
		},
		
		_hasChanged: function() {
			
			var field = this;
			
			var index = this.main.findExpandedElement().index;
			
			var hours = this._inputHours.val();
			var minutes = this._inputMinutes.val();
			var seconds = this._inputSeconds.val();
			var date = this._dateInstance.datepicker('getDate');
			date.setHours(hours);
			date.setMinutes(minutes);
			date.setSeconds(seconds);
			this.setExpanderValue(date, hours, minutes, seconds);
			
			
			this.main.changeValue(index, date.getTime());
			this._setValueText(index, date);
		},
		
		setExpanderValue: function(date, hours, minutes, seconds) {
			
			
			if($.isNumeric(hours) && hours < 24 && hours >= 0)
				hours = Math.round(hours);
			else {}
			//	hours = 0;
				//field.main.setValidState(false);
				
			if($.isNumeric(minutes) && minutes < 60 && minutes >= 0)
				minutes = Math.round(minutes);
			else {}
			//	minutes = 0;
				
				//field.main.setValidState(false);
				
			if($.isNumeric(seconds) && seconds < 60 && seconds >= 0)
				seconds = Math.round(seconds);
			else {}
			//	seconds = 0;
				//field.main.setValidState(false);
			
			var rotHours = hours / 12 * 360;
			var rotMinutes = minutes / 60 * 360;
			var rotSeconds = seconds / 60 * 360;
			
			this._setAigRot(this._aidSeconds, rotSeconds);
			this._setAigRot(this._aidMinutes, rotMinutes);
			this._setAigRot(this._aidHours, rotHours);
			
			
			this._dateInstance.datepicker('setDate', date);	
		
		
			//if(!(date.setHours(hours) && date.setMinutes(minutes) && date.setSeconds(seconds)))
			//	field.main.setValidState(false);
		},
		
		
		_setAigRot: function(aigDom, rot) {
			
			
			aigDom.css({
				'-moz-transform':  'translate(85px, 85px) rotate(' + rot + 'deg) translate(-50%, -90%)',
	  	    		'-webkit-transform':  'translate(85px, 85px) rotate(' + rot + 'deg) translate(-50%, -90%)',
		    		'-o-transform':  'translate(85px, 85px) rotate(' + rot + 'deg) translate(-50%, -90%)',
		    		'-ms-transform':  'translate(85px, 85px) rotate(' + rot + 'deg) translate(-50%, -90%)',
		    		'transform':  'translate(85px, 85px) rotate(' + rot + 'deg) translate(-50%, -90%)'
			});
		},
		
		setValue: function(index, timestamp) {

			var date = new Date();
			if(!(timestamp == undefined || timestamp == null || timestamp == 0))
				date.setTime(timestamp);
			else
				return;
			
			
			this._setValueText(index, date);
			this.main.changeValue(index, timestamp);
		},
		
		_addZero: function(val) {
			if((val + "").length == 1)
				return "0" + val;
			return val;
		},
		
		_setValueText: function(index, date) {
			BI.lang = {};
			BI.lang.months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
			var str = '<nobr>' + this._addZero(date.getDate()) + " " + Util.getMonth(date.getMonth()) + " " + date.getFullYear() + " " + this._addZero(date.getHours()) + ":" + this._addZero(date.getMinutes()) + ":" + this._addZero(date.getSeconds()) + '<nobr>';
			
			  
			(this.main.fields[index].field || this.main.fields[index].html).html(str);		
		},
		
		fillExpander: function() {
			
			var baseUrl = './plugins/terreauxspectacles/scripts';
			var html = [];
			html.push('<div class="bi-formfield-datetime-picker"></div>');
			html.push('<div class="bi-formfield-datetime-time">');
			
				html.push('<div class="bi-formfield-timeinput">');
					html.push('<input class="bi-formfield-timehours" maxlength="2" />:');
					html.push('<input class="bi-formfield-timeminutes" maxlength="2" />:');
					html.push('<input class="bi-formfield-timeseconds" maxlength="2" />');
				html.push('</div>');
				html.push('<br />');
			html.push('<img src="' + baseUrl + '/styles/images/minutes.png" class="aig minutes" /><img src="' + baseUrl + '/styles/images/hours.png" class="aig hours" /><img src="' + baseUrl + '/styles/images/seconds.png" class="aig seconds" /><img src="' + baseUrl + '/styles/images/clock.png" /></div>');
			html.push('<div class="bi-spacer"></div>');
			
			this.main.domExpander.html(html.join(''));	
			
		}
	});
});