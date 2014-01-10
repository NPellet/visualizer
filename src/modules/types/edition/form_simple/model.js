define(['modules/default/defaultmodel', 'src/util/datatraversing'], function(Default, DataTraversing) {
	
	function model() { };
	model.prototype = $.extend( true, {}, Default, {


		getjPath: function( rel ) {

			var jpaths = [];

			switch( rel ) {

				case 'formValue':
				console.log( this.module.view.formValue );
					DataTraversing.getJPathsFromElement( this.module.view.formValue, jpaths );
				break;
			}

			return jpaths;
		}
	} );
	
	return model;
});
