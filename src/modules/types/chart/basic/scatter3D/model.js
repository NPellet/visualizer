define(['modules/default/defaultmodel', 'src/util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {
	  getjPath: function(rel) {
		  var data;
		  switch(rel) {
			  case 'point':
				  data = this.module.data || new DataArray();
				  data = data.get(0);
				  if(!data) {
					  return [];
				  }

				  break;
			  default:
				  data = this.module._data;
				  break;
		  }
      var jpaths = [];
      Traversing.getJPathsFromElement(data, jpaths);
      return jpaths;
	  }
	});
	
	return model;
});