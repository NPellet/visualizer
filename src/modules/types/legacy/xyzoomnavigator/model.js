define(['modules/default/defaultmodel'], function(Default) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getjPath: function(rel) {
			return [];
		}
	});
	
	return model;
});