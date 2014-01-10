define(['modules/default/defaultmodel', 'src/util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},
		
		
		getjPath: function(rel, accepts) {
			
			function getjPath(data) {
				
				if(data == null)
					return [];

				var jpaths = [];
				Traversing.getJPathsFromElement(data, jpaths);
				
				return jpaths;
			}
			
			var data = this.module.getDataFromRel('matrix');
			
			if(!data)
				return;
			
			data = data.value;
			if(!data)
				return;
				
			switch(rel) {
				case 'row':

					var data = data.yLabel[0];
					return getjPath(data, accepts);
				break;
				case 'col':
					var data = data.xLabel[0];
					return getjPath(data, accepts);
				break;
				
				case 'intersect':

					var data = data.data[0][0];
					return getjPath(data, accepts);
				break;

				default:
					return false;
				break;
			}
		}

	});

	return model;
});