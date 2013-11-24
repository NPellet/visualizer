
define( [ 'jquery', 'jqueryui' ], function( $, jqueryui ) {

	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		var self = this,
			dom = $("<div />"),
			div = $( "<div></div>" )
					.addClass( 'field-list' )
					.appendTo( dom ),
			lastVal,
			slider = $("<div />")
					.appendTo( div )
					.slider({
						min: this.field.options.min,
						max: this.field.options.max,
						step: this.field.options.step,

						change: function( event, ui ) {

							if( lastVal !== ui.value && ! isNaN( ui.value ) ) {
								lastVal = ui.value;
								valueInput.val( ui.value );

								self.setValueSilent( ui.value );
							}
						},

						slide: function( event, ui ) {
							
							if( !isNaN( ui.value )) {
								lastVal = ui.value;
								valueInput.val( ui.value );

								self.setValueSilent( ui.value );
							}
						}
					}),

			valueInput = $("<input />").bind( 'keyup' , function( ) {
				
				var val = $( this ).val( ),
					floatVal = parseFloat( val );

				if( !isNaN( val ) && isFinite( val ) ) {
					lastVal = floatVal;
					self.slider.slider( 'value', floatVal );
				}
			}),

			valueWrap = $("<div />")
							.addClass( 'forms-field-slider-value')
							.appendTo( div )
							.append( ' <span>Value : </span> ' )
							.append( valueInput );


		this.fieldElement = div;
		this.div = div;
		this.dom = dom;
		this.slider = slider;
		
		return dom;
	};

	FieldConstructor.prototype.checkValue = function() {

		if( this.slider && !isNaN( this.value ) ) {
			this.slider.slider( 'value', this.value );	
		}
	}

	return FieldConstructor;
});