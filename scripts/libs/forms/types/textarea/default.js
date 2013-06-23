define(['forms/fielddefault'], function(Default) {
	
	return $.extend({}, Default, {
		setValue: function(index, value) {	
			this.main.fields[index].field.val(value);
			this.main.changeValue(index, value);
		}
	});
	
});