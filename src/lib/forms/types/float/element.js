
define( [ 'require', '../text/element'], function( require, textElement ) {

	var FieldConstructor = function() {};
	
	$.extend( FieldConstructor.prototype, textElement.prototype );


	FieldConstructor.prototype.validate = function( value ) {

		var floatVal = parseFloat( value );

		if( value == "" || floatVal == value ) {
			
			this.validation.value = floatVal;	
			this.validation.error = false;

		} else {

			this.validation.errorType = 1;
		}
	}

	return FieldConstructor;
});