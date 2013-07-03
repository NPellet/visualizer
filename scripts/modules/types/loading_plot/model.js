define(['modules/defaultmodel'], function(Default) {
	
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
				var jpaths = []; 
				var structure = [];
				var structure = CI.DataType.getStructureFromElement(data, structure)
				if(rel == 'element') {
					if(structure.elements)
						CI.DataType.getJPathsFromStructure(structure.elements.series, null, jpaths);
				}
				return jpaths;
			}

			switch(rel) {
				case 'element':
					relObj = 'loading';
				break;
			}
			var data = this.module.getDataFromRel(relObj);	
			return getjPath(data);
		}
	});
	
	return model;
});
