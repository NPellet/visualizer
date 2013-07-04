define(['modules/defaultmodel','util/datatraversing'], function(Default,Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},
				
		getjPath: function(rel) {
			function getjPath(data) {
				var jpaths = [];
				Traversing.getJPathsFromElement(data, jpaths);
				return jpaths;
			}
			var data = this.module.getDataFromRel('list');
			if(!data || data == null)
				return;
			data = data[0];
			return getjPath(data);
		}
	});

	return model;
});
