
define( [ ], function(  ) {

	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		var self = this,
			dom = $("<div />"),

			input = $( "<input />" , { type: 'text' } )
					.addClass( 'field-list' )
					.appendTo( dom )
					.bind('click', function( event ) {
						self.toggleSelect( event );
					})
					.bind('keyup blur', function() {
						var val;
						if( self.value !== ( val = $( this ).val( ) ) ) {
							self.setValueSilent( $( this ).val( ) );
						}

					}).bind('keydown', function( e ) {

						if( self.field.form.tabPressed( e, self ) ) {
							this.blur( );
						}

					});


		if( this.field.getOptions ( this ) ) {

			input.autocomplete( {
				minLength: 0,
				source: this.field.getOptions ( this )
			});
			
			input.autocomplete( 'widget' ).addClass( 'form-autocomplete' );
			input.autocomplete( 'search', this.value ); // To allow to display everything when the field is blank
		}


		this.dom = dom;
		this.input = input;
		this.fieldElement = input;

		this.checkValue();

		return dom;
	};

	FieldConstructor.prototype.checkValue = function() {

		if( this.dom ) {
			this.input.val(this.value);
		}
	};

	FieldConstructor.prototype.getOptions = function() {
		return this.autocomplete || false;
	};

	FieldConstructor.prototype.setOptions = function(options) {
		this.autocomplete = options;
	};

	return FieldConstructor;
});