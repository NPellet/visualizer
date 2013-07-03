define(['modules/defaultmodel'], function(Default) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getjPath: function(rel, accepts) {
			return {};
		}
	});
	
	return model;
});
