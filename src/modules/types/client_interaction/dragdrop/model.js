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
                    
                    // Populate tmpVars with empty object so the user can set a variable out even if no file was dropped
                    var definedDrops;
                    if(definedDrops = this.module.getConfiguration("vars")) {
                        for(var i = 0; i < definedDrops.length; i++) {
                            var def = definedDrops[i];
                            if(!this.tmpVars.hasOwnProperty(def.variable)) {
                                this.tmpVars[def.variable] = new DataObject();
                            }
                        }
                    }
                    return Traversing.getJPathsFromElement(this.tmpVars, jpaths), jpaths;
		}
	});

	return model;
});
