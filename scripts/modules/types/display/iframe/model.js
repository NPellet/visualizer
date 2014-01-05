define(['modules/defaultmodel'], function(Default) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {


		getValue: function() {
			return this.dataValue;
		},
		
		getjPath: function(rel, accepts) {
			return [];	
		}

	});
	
	return model;
});