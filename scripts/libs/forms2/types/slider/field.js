
define( [ require, '../../field', ], function( require, FieldDefaultConstructor ) {

	var FieldConstructor = function(name) {

		var self = this;
		this.name = name;
	};

	FieldConstructor.prototype = new FieldDefaultConstructor( );

	FieldConstructor.prototype.initimpl = function() {
		 
		 $.extend(this.options, {
		 	min: 0,
		 	max: 1,
		 	step: 0.1
		 });

	}

	return FieldConstructor;
});
