define(['modules/defaultmodel', 'util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getjPath: function(rel, accepts) {
			var jpath = [];
			Traversing.getJPathsFromElement(this.module.model.data || {}, jpath);
			return jpath;
		}

	});
	
	return model;
});
