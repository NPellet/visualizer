define(['modules/default/defaultmodel','src/util/datatraversing'], function(Default,Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {
	});
	
	return model;
});
