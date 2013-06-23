define(['forms/fielddefault'], function(Default) {

	return $.extend({}, Default, {
		setValue: function(index, value) {
			this.main.fields[index].field.data('editor').setValue(value);
			this.main.changeValue(index, value);
		},

		buildHtml: Default.buildHtml
	});
});
