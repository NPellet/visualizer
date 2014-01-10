define(['modules/default/defaultmodel','src/util/datatraversing'], function(Default,Traversing) {
	
	function model() {};
	
	model.prototype = $.extend(true, {}, Default, {
		getValue: function() {
			return this.dataValue;
		},
		
		
		getjPath: function(rel) {
			
			function getjPath(data) {
				// It's an array of equivalent elements
				// Don't need to merge a list
				// It's like that since the data is typed and we know the structure
				data = Traversing.getValueIfNeeded(data);
				var data = data[0];
				var jpaths = []; 
				
				Traversing.getJPathsFromElement(data, jpaths);
				return jpaths;
			}

			switch(rel) {
				default:
				case 'element':
					rel = 'list';
				break;
			}
			var data = this.module.getDataFromRel(rel);
			if(!data || data == null)
				return;
			//data = data.getData();
			if(data == null)
				return;
			return getjPath(data);
		}

	});

	return model;

});
	