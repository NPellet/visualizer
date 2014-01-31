define(['modules/default/defaultmodel','src/util/datatraversing'], function(Default,Traversing) {
	
	function model() {
            this.tmpVars = new DataObject();
        };
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},
				
		
		getjPath: function(rel, accepts) {
                    var jpaths = [];
                    return Traversing.getJPathsFromElement(this.tmpVars, jpaths), jpaths;
		}
	});

	return model;
});
