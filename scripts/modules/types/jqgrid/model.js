define(['modules/defaultmodel', 'util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},
		
		getjPath: function(rel) {
			
			var data = this.module.data || [];
			data = Traversing.getValueIfNeeded(data);
			var data = data[0];
			var jpaths = []; 
			Traversing.getJPathsFromElement(data, jpaths);
			
			return jpaths;
		}
	});

	return model;
});
	