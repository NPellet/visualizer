define(['modules/model'], function(Default) {
	
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
				CI.DataType.getJPathsFromElement(data, jpaths);
				
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
				console.log(data);
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