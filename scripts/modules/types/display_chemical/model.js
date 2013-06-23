define(function(['modules/model'], function(Default)) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getjPath: function(rel) {
			var data = this.module.getDataFromRel('chemical');
			if(!data)
				return;
			var jpaths = {};
			CI.Types._getjPath(data[i], jpaths);
			return jpaths;
		}

	});

	return model;
});