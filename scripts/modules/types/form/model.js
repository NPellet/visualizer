define(['modules/defaultmodel','util/datatraversing'], function(Default,Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {
	});
	
	return model;
});
