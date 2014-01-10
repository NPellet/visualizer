
define( [ ], function(  ) {

	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		var self = this,
			dom = $("<div />"),
			div = $( "<div></div>", { tabindex: 1 } )
				.addClass( 'form-field' )
				.on('click', function() {
					self.toggleSelect( event );
				})
				.on('click', 'input[type="checkbox"]', function( event ) {

					event.stopPropagation();

					var id = $(this).attr('data-checkbox-id');
					var value = self.value || [];

					if( $(this).is(':checked') ) {

						value.push( id );

					} else if( ( id = value.indexOf( id ) ) > -1 ) {

						value.splice( id, 1 );

					}

					self.setValueSilent(value);
				})
				.on('keydown', 'input[type="checkbox"]', function( event ) {
					

					//event.preventDefault();
					event.stopPropagation();
					//self.form.tabPressed( event, self);
				})
				.on('keydown', 'input[type="checkbox"]:last', function( event ) {
					
					event.preventDefault();
					event.stopPropagation();
					if( self.form.tabPressed( event, self) ) {
						this.blur();
					}
				})
				.appendTo( dom );

		this.div = div;
		this.dom = dom;
		this.fieldElement = div;
		this.checkboxes = {};

		var i, options = this.field.getOptions( this );

		for( i in options ) {
			this.checkboxes[ i ] = ( $( '<input type="checkbox" tabindex="1" data-checkbox-id="' + i + '" />' + options[ i ] + '<br />' ) );
			this.div.append( this.checkboxes[ i ] );
		}

		return dom;
	};

	FieldConstructor.prototype.focus = function() {

		this.fieldElement.find('input:first').focus();
		this.select();
	}

	FieldConstructor.prototype.checkValue = function() {

		if( this.dom ) {

			if( ! ( this.value instanceof Array ) ) {

				if(this.value == null || this.value == "") {

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

					element.prop( 'checked', 'checked' );

				} else {

					element.removeProp( 'checked' );
					
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