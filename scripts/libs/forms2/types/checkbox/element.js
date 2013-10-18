
define( [ ], function(  ) {

	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		var self = this,
			dom = $("<div />"),
			div = $( "<div></div>" )
					.addClass( 'form-field' )
					.on('click', function() {
						self.select();
					})
					.on('click', 'input[type="checkbox"]', function() {

						var id = $(this).attr('data-checkbox-id');
						var value = self.value || [];

						if( $(this).is(':checked') ) {

							value.push( id );

						} else if( id = value.indexOf( id ) ) {

							value.splice( id, 1 );

						}

						self.value = value;
					})
					.appendTo( dom );

		this.div = div;
		this.dom = dom;
		this.checkboxes = {};

		var i, options = this.field.getOptions( this );

		for( i in options ) {
			this.checkboxes[ i ] = ( $( '<input type="checkbox" data-checkbox-id="' + i + '" />' + options[ i ] + '<br />' ) );
			this.div.append( this.checkboxes[ i ] );
		}

		return dom;
	};

	FieldConstructor.prototype.checkValue = function() {

		if( this.dom ) {

			if( ! ( this.value instanceof Array ) ) {

				if(this.value == null) {

					this.value = [];
				} else {

					this.value = [ this.value ];
				}
				return;
			}

			var val = this.value,
				options = this.field.getOptions( this );
				

			$.each( this.checkboxes, function( index, element ) {
				
				if( val.indexOf( index ) > -1  ) {

					element.attr( 'checked', 'checked' );

				} else {

					element.removeAttr( 'checked' );
					
				}
				
			});
		}
	}

	FieldConstructor.prototype.getOptions = function() {
		return this.combooptions || false;
	}

	FieldConstructor.prototype.setOptions = function(options) {
		this.combooptions = options;
	}

	return FieldConstructor;
});