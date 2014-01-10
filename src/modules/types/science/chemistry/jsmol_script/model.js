define(['modules/default/defaultmodel'], function(Default) {

	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			console.log("Called");
			return this.script;
		},
		
		getjPath: function(rel) {
			return {};
		}
	});
	return model;
});