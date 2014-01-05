define(['modules/defaultmodel', 'util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},
		
		getjPath: function(rel, accepts) {
			var value=this.module.view._value || {};
			while (value.children && value.children.length>0) {
				value=value.children[0];
			}
			var jpaths = [];
			Traversing.getJPathsFromElement(value, jpaths);
			switch(rel) {
				case 'node':
					return jpaths;
				break;

				default:
					return false;
				break;
			}
		}
	});

	return model;
});
