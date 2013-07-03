define(['modules/defaultmodel'], function(Default) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},
				
		getjPath: function(rel) {
			function getjPath(data) {
				var jpaths = [];
				CI.DataType.getJPathsFromElement(data, jpaths);
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
