
define( [ '../../field' ], function( FieldDefaultConstructor ) {

	var FieldConstructor = function(name) {
		this.name = name;
	};

	FieldConstructor.prototype = new FieldDefaultConstructor();

	return FieldConstructor;

});