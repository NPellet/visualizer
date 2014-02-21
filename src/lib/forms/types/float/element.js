
define( [ 'require', '../text/element'], function( require, textElement ) {

	var FieldConstructor = function() {};
	
	$.extend( FieldConstructor.prototype, textElement.prototype );


	FieldConstructor.prototype.validate = function( value ) {

		var floatVal = parseFloat( value );

		if( value == "" || floatVal == value ) {
			this.validation.value = floatVal;	

			if( this.validation.error ) {
				if( this.hideError() ) {
					this.validation.error = false;
				}
			}

			this.validation.error = false;

		} else {

			this.validation.errorType = 1;

			if( ! this.validation.error ) {
				if( this.showError() ) {
					this.validation.error = true;
				}
			}
		}
	}
	
	FieldConstructor.prototype.showError = function( ) {
		console.log( this.dom );
		if( ! this.dom ) {
			return;
		}
		this.dom.addClass('form-field-error');
		return true;
	}

	FieldConstructor.prototype.hideError = function( ) {
		if( ! this.dom ) {
			return;
		}
		this.dom.removeClass('form-field-error');
	}

	return FieldConstructor;
});