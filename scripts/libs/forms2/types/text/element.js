
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
					});

		this.dom = dom;
		this.input = input;
		this.fieldElement = input;
		return dom;
	};

	FieldConstructor.prototype.checkValue = function() {

		if( this.dom ) {
			this.input.val(this.value);
		}

	}

	return FieldConstructor;
});