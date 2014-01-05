define(['modules/defaultmodel', 'util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},

		getjPath: function(rel, accepts) {

			var data = this.module.getDataFromRel('list');
			
			if( ! data || data == null ) {
				return;
			}

			data = data.getData( );
			
			if( data == null ) {
				return;
			}
			
			var jpath = {};
			Traversing._getjPath( data[ i ], jpath );	
			return jpath;
		}
	});
	
	return model;
});
