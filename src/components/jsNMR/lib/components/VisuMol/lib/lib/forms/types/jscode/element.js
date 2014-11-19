
define( [ 'require', 'jquery', 'ace/ace' ], function( require, $, ace ) {


	var FieldConstructor = function() {};
	
	FieldConstructor.prototype.__makeDom = function() {
		
		this._id = Math.random() + Date.now();

		var self = this,
			dom = $("<div />"),

			input = $( "<div />", { id: this._id, tabindex: 1 } )
					.css({
						width: '100%',
						height: '200px',
					    position: 'relative',
					    padding: 0,
					    margin: 0
					})
					.addClass( 'field-list' )
					.appendTo( dom );
		
		this.fieldElement = input;
		this.input = input;
		this.dom = dom;
		return dom;
	};

	FieldConstructor.prototype.focus = function() {

		if( this.editor ) {
			this.editor.focus();
		}
		
	}

	FieldConstructor.prototype.inDom = function() {

		var self = this;
		var editor = ace.edit( self._id );
                var mode = this.field.options.mode || "javascript";

	    editor.setTheme( "./theme/monokai" );
	    editor.setPrintMarginColumn( false );
	    editor.getSession( ).setMode( "./mode/"+mode );
		
		editor.getSession( ).on( 'change', function(e) {
			
			self.setValueSilent( editor.getValue( ) );
		} );

		this.editor = editor;

		this.checkValue( );
	}

	FieldConstructor.prototype.checkValue = function() {

		if( this.editor ) {
			this.editor.setValue( this.value );
		}
	}

	return FieldConstructor;
});