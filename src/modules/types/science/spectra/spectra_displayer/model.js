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
                                    data = [0,0];
					break;
				case 'markerInfos':
					data = this.module.controller.infos;

					break;
				case 'shapeInfos':
					var annot = this.module.getDataFromRel('annotations');
					if(annot) {
						data = annot[0];
						break;
					}
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
