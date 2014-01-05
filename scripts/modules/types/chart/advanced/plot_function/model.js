define(['modules/defaultmodel'], function(Default) {
	function model() {};
	model.prototype = $.extend(true, {}, Default, {
	});
	return model;
});