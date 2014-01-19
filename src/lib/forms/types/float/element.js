
define( [ 'require', '../text/element'], function( require, textElement ) {

	var FieldConstructor = function() {};
	
	$.extend( FieldConstructor.prototype, textElement.prototype );


	FieldConstructor.prototype.validate = function( value ) {

		var floatVal = parseFloat( value );

		if( floatVal == value ) {
			this.validation.value = floatVal;	

			if( this.validation.error ) {
				this.hideError();
			}

			this.validation.error = false;

		} else {

			this.validation.errorType = 1;

			if( ! this.validation.error ) {
				this.showError();
			}

			this.validation.error = true;
		}
	}
	
	FieldConstructor.prototype.showError = function( ) {
		this.dom.addClass('form-field-error');
	}

	FieldConstructor.prototype.hideError = function( ) {
		this.dom.removeClass('form-field-error');
	}

	return FieldConstructor;
});