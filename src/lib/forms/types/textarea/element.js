
define( [ ], function(  ) {

	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		var self = this,
			dom = $("<div />"),

			input = $( "<textarea />" )
					.addClass( 'field-list' )
					.appendTo( dom )
					.bind('keyup blur', function() {
						var val;
						if( self.value !== ( val = $( this ).val( ) ) ) {
							self.value = $( this ).val( );
						}
					});

		this.dom = dom;
		this.input = input;
		return dom;
	};

	FieldConstructor.prototype.checkValue = function() {

		if( this.dom ) {
			this.input.val(this.value);
		}
	}

	return FieldConstructor;
});