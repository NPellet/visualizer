define(['modules/default/defaultmodel', 'src/util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},

		getjPath: function(rel, accepts) {


			var data;

			switch(rel) {
				case 'markerXY':
					break;
				case 'markerInfos':
					data = this.module.controller.infos;

					break;

				default:
					data = this.module.data;
				break;
			}

			if(!data) return [];

			var jpaths = []; 
			Traversing.getJPathsFromElement(data, jpaths);
			return jpaths;

		}

			

	});
	
	return model;
});
