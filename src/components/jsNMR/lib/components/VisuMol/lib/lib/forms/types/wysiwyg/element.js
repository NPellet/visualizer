
define( [ 'require', 'jquery', 'ckeditor' ], function( require, $, CKEDITOR ) {

	CKEDITOR.disableAutoInline = true;

	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		this._id = Math.random() + Date.now();

		var dom = $("<div />"),
			input = $( "<div />", { name: this._id } )
				.addClass( 'field-list' )
				.appendTo( dom );
		
		this.dom = dom;
		return dom;
	};


	FieldConstructor.prototype.inDom = function() {

		var self = this;

		this._editor = CKEDITOR.replace(this._id, {
			customConfig: "../../" + require.toUrl('./') + 'ckeditor_config.js',
			extraPlugins: 'onchange'
		});

		this._editor.on('change', function() {	

			if( self._editor.checkDirty( ) ) {

				self.setValueSilent( self._editor.getData( ) );

			}
		});

		this.checkValue( );
	};

	FieldConstructor.prototype.checkValue = function() {

		if( this._editor ) {
			this._editor.setData( this.value );
		}
	};

	return FieldConstructor;
});