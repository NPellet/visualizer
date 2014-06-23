define(['modules/default/defaultmodel', 'src/util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},
		
		getjPath: function(rel) {
      return [];
      switch(rel) {
      case 'info':
        if(!this.module._data) {
          return [];
        }
        return Traversing.getJPathsFromElement(this.module._data);
      default: 
      return [];
      }
		}
	});

	return model;
});
	