define(['modules/default/defaultmodel', 'src/util/datatraversing'], function(Default, Traversing) {
	
	function model() {};
	model.prototype = $.extend(true, {}, Default, {

		getValue: function() {
			return this.dataValue;
		},
		

		getjPath: function(rel) {
			var data = [];

			switch(rel) {

				case 'mzList':
				case 'selectedIngredient':

					data = this.module.view.gcmsInstance.ingredients[ 0 ][ 0 ];
					console.log( data );
				break;


				default:
				case 'gcdata':

					data = this.module.view.jcamp.gcms.gc;
				
				break;
			}

			var jpaths = [];
			Traversing.getJPathsFromElement(data, jpaths);

			return jpaths;
		}


	});

	return model;
});
	