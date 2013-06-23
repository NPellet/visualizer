define(function(['modules/model'], function(Default)) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getjPath: function(rel, accepts) {
			return {};
		}
	});
	
	return model;
});
