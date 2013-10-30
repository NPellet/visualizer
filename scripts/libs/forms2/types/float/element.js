
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


		this.checkValue();


		this.dom = dom;
		this.input = input;
		this.fieldElement = input;

		return dom;
	};

	FieldConstructor.prototype.checkValue = function(error) {
		if( parseFloat( ) )
	}

	FieldConstructor.prototype.inDom = function() {

		var self = this;

		if( this.field.getOptions ( this ) ) {

			this.input.autocomplete( {
				minLength: 0,
				source: this.field.getOptions ( this )
			});

			this.input.bind('focus', function() {
				self.input.autocomplete( 'search', self.value );
			});

			this.input.autocomplete( 'widget' ).addClass( 'form-autocomplete' );
			//this.input.autocomplete( 'search', this.value ); // To allow to display everything when the field is blank
		}
	}

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