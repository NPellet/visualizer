define(['modules/defaultmodel', 'util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},
		
		getjPath: function(rel, temporary) {
			var data;
			switch(rel) {
				default:
				case 'element': // Wants to get the row ?
					data = (temporary && temporary['list']) ? temporary['list'] : (this.module.data || []);
					data = data.get(0)[0];
				break;
			}

			var jpaths = []; 
			Traversing.getJPathsFromElement(data, jpaths);
			return jpaths;
		}
	});

	return model;
});
	