
define( [ 'jquery', 'src/util/util', 'ckeditor' ], function( $, Util ) {

	CKEDITOR.disableAutoInline = true;

	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		this._id = Util.getNextUniqueId();

		var self = this,
			dom = $("<div />"),

			input = $( "<div />", { name: this._id } )
					.addClass( 'field-list' )
					.appendTo( dom );
		
		this.dom = dom;
		return dom;
	};


	FieldConstructor.prototype.inDom = function() {

		var self = this;

		this._editor = CKEDITOR.replace(this._id, {
			extraPlugins: 'onchange'
		});

		this._editor.on('change', function() {	

			if( self._editor.checkDirty( ) ) {

				self.setValueSilent( self._editor.getData( ) );

			}
		});

		this.checkValue( );
	}

	FieldConstructor.prototype.checkValue = function() {

		if( this._id && CKEDITOR.instances[ this._id ] ) {

			CKEDITOR.instances[this._id].setData( this.value );
		}
	}

	return FieldConstructor;
});