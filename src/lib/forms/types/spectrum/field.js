
define( [ require, '../../field', 'src/util/util', 'jqueryui', 'components/farbtastic/src/farbtastic', 'components/spectrum/spectrum' ], function( require, FieldDefaultConstructor, Util, ui, spectrum ) {

	var FieldConstructor = function(name) {
    console.log('field constructor')
		var self = this;

    $('head').append('<link rel="stylesheet" href="./components/spectrum/spectrum.css" />')
		this.name = name;
		this.domExpander = $("<div></div>");
    this.domExpander.append('<div><input type="text"></input></div>')
    $(this.domExpander).children('div').css('float','left').addClass('form-spectrum');
    $(this.domExpander).find('input').spectrum({
      color: "#ffffff",
      localStorageKey: 'visualizer-spectrum',
      flat: true,
      clickoutFiresChange: true,
      showAlpha: true,
      showInitial:true,
      change: function(color) {
        var rgb = color.toRgb();
        self.getElementExpanded( ).value = [ rgb['r'], rgb['g'], rgb['b'], rgb['a'] ];
        self.form.hideExpander();
      }
    });
    
    console.log('spectrum', this.domExpander);
		$("<div />").addClass('clear').appendTo( this.domExpander );
	};

	FieldConstructor.prototype = new FieldDefaultConstructor( );

	FieldConstructor.prototype.getOptions = function( fieldElement ) {
		
		return fieldElement.getOptions() || this.options.options
	};

	FieldConstructor.prototype.showExpander = function( fieldElement ) {

		this._showExpander( fieldElement );
		var value = fieldElement.value || [0, 0, 0, 1];
    this.domExpander.find('.form-spectrum').spectrum('set', Util.rgbToHex( value[0], value[1], value[2] ));
    
    // $.farbtastic( this.domExpander.children( '.form-colorpicker' ) ).setColor( Util.rgbToHex( value[0], value[1], value[2] ) );
    // this.domExpander.children( '.form-slider' ).slider( 'value', value[ 3 ] );
	};

	return FieldConstructor;

});