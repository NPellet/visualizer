
define( [ require, '../../field', 'src/util/util', 'jqueryui', 'components/farbtastic/src/farbtastic' ], function( require, FieldDefaultConstructor, Util, ui ) {

	var FieldConstructor = function(name) {

		var self = this;

		this.name = name;
		this.domExpander = $("<div></div>");

		$("<div></div>").addClass('form-colorpicker').css({ 'float': 'left' }).farbtastic(function(color) {

			if( self.getElementExpanded( ) ) {
				var value = Util.hexToRgb(color);

				self.getElementExpanded( ).value = [ value[ 0 ], value[ 1 ], value[ 2 ], self.getElementExpanded( ).value[ 3 ] ] ;
			}

		}).appendTo( this.domExpander );

		$("<div></div>").addClass('form-slider').css({ height: '180px', marginLeft: '20px', float: 'left' }).slider({ 

			orientation: "vertical",
		    min: 0,
		    max: 1,
		    step: 0.01,

		    start: function( event, ui ) {
		    	//event.preventDefault();
		    	event.stopPropagation();
		    },

		    slide: function( event, ui ) {

		    	self.getElementExpanded( ).value = [ self.getElementExpanded( ).value[ 0 ], self.getElementExpanded( ).value[ 1 ], self.getElementExpanded( ).value[ 2 ], ui.value ] ;
		   		event.stopPropagation( );
		    },

		    stop: function( event ) {

		    	event.preventDefault( );

		    }

		}).appendTo( this.domExpander );


		$("<div />").addClass('clear').appendTo( this.domExpander );
	};

	FieldConstructor.prototype = new FieldDefaultConstructor( );

	FieldConstructor.prototype.getOptions = function( fieldElement ) {
		
		return fieldElement.getOptions() || this.options.options
	};

	FieldConstructor.prototype.showExpander = function( fieldElement ) {

		this._showExpander( fieldElement );
		var value = fieldElement.value || [0, 0, 0, 1];
		$.farbtastic( this.domExpander.children( '.form-colorpicker' ) ).setColor( Util.rgbToHex( value[0], value[1], value[2] ) );
		this.domExpander.children( '.form-slider' ).slider( 'value', value[ 3 ] );
	};

	return FieldConstructor;

});