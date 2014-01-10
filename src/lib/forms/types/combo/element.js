
define( [ ], function(  ) {

	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		var self = this,
			dom = $("<div />"),
			div = $( "<div>&nbsp;</div>" )
					.addClass( 'form-field' )
					.attr('tabIndex', '1')
					.appendTo( dom )
					.bind('click', function( event ) {

						self.select( event );
						event.stopPropagation();
					});

		this.fieldElement = div;
		this.div = div;
		this.dom = dom;
		
		return dom;
	};

	FieldConstructor.prototype.checkValue = function() {

		if( this.dom ) {

			var val = this.value,
				options = this.field.getOptions( this ),
				text = this.lookRecursively( val, options );

			if( text !== undefined ) {
				this.div.html( text.title );

			//	this.fieldElement.trigger( 'focus' );
			//	this.form.hideExpander( true );				
			} else {
				this.div.html( '' );
			}
		}

	}

	FieldConstructor.prototype.lookRecursively = function(key, pool) {
		
		if( ! pool ) {
			return;
		}	

		var found = false,
			i = 0, l = pool.length;

		if( ! pool ) {
			return;
		}

		for(  ; i < l ; i++) {

			if( pool[ i ].key == key ) {
				return pool[ i ];
			}
			
			if( pool[ i ].children ) {

				if(found = this.lookRecursively( key, pool[ i ].children ) ) {
					
					return found;
				}
			}
		}

		return;
	},



	FieldConstructor.prototype.getOptions = function() {
		return this.combooptions || false;
	}

	FieldConstructor.prototype.setOptions = function(options) {
		this.combooptions = options;
		this.checkValue( );
	}

	return FieldConstructor;
});