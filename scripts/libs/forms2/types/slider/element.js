
define( [ 'jquery', 'jqueryui' ], function( $, jqueryui ) {

	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		var self = this,
			dom = $("<div />"),
			div = $( "<div></div>" )
					.addClass( 'field-list' )
					.appendTo( dom ),
			lastVal = [],
			changing,
			range = self.field.options.range,
			slider = $("<div />")
					.appendTo( div )
					.slider( {

						min: this.field.options.min,
						max: this.field.options.max,
						step: this.field.options.step,

						range: this.field.options.range,

						change: function( event, ui ) {
								
							ui.value = range ? ui.values[ changing ] : ui.value;

							if( valueInput[ changing ] && lastVal[ changing ] !== ui.value && ! isNaN( ui.value ) ) {
								lastVal[ changing ] = ui.value;
								valueInput[ changing ].val( lastVal[ changing ] );	
								self.setValueSilent( lastVal );
							}
						},

						slide: function( event, ui ) {
							
							var index = $(ui.handle).index();
							changing = index;

							if( range ) {
								changing --;
							}
							
							ui.value = range ? ui.values[ changing ] : ui.value;

							if( !isNaN( ui.value )) {
							
								if( valueInput[ changing ] && lastVal[ changing ] !== ui.value && ! isNaN( ui.value ) ) {

									lastVal[ changing ] = ui.value;

									if( valueInput[ changing ] ) {
										valueInput[ changing ].val( lastVal[ changing ] );	
										self.setValueSilent( lastVal );
									}
								}
							}
						}
					}),

			valueWrap = $("<div />")
				.addClass( 'forms-field-slider-value')
				.appendTo( div ),
			valueInput = [];

		valueInput[ 0 ] = $("<input />").bind( 'keyup' , function( ) {
			
			var val = $( this ).val( ),
				floatVal = parseFloat( val );

			if( !isNaN( val ) && isFinite( val ) ) {
				lastVal[ 0 ] = floatVal;
				changing = 0;

				if( range ) {
					self.slider.slider( 'values', changing, floatVal );
				} else {
					self.slider.slider( 'value', floatVal );
				}
			}
		});

		valueWrap.append( this.field.options.range ? '<span>Min</span>' : '<span>Value</span>' ).append( valueInput[ 0 ] );

		if( this.field.options.range ) {

			valueInput[ 1 ] = $("<input />").bind( 'keyup' , function( ) {
				
				var val = $( this ).val( ),
					floatVal = parseFloat( val );

				if( !isNaN( val ) && isFinite( val ) ) {
					lastVal[ 1 ] = floatVal;
					changing = 1;
					self.slider.slider( 'values', changing, floatVal );
				}
			});

			valueWrap.append( '<span>Max</span>' ).append( valueInput[ 1 ] );
		}

		this.fieldElement = div;
		this.div = div;
		this.dom = dom;
		this.slider = slider;
		
		return dom;
	};

	FieldConstructor.prototype.checkValue = function() {

		if( this.slider && !isNaN( this.value ) ) {

			if( this.field.options.range ) {

				if( this.value instanceof Array ) {
					for( var i = 0, l = this.value.length; i < l ; i ++ ) {
						this.slider.slider( 'value', i, this.value[ i ] );	
					}
				}
			} else {
				this.slider.slider( 'value', this.value );	
			}

			
		}
	}

	return FieldConstructor;
});