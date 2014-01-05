define(['modules/defaultmodel', 'util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {


		getValue: function() {
			return this.dataValue;
		},
		
		getjPath: function(rel, accepts) {
			var data = this.module.getDataFromRel( rel ),
				jpaths = [];

			Traversing.getJPathsFromElement(data, jpaths);

			return jpaths;
		}

	});
	
	return model;
});
	