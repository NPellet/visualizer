define(['./fieldelement'], function(FieldElement) {

	var FieldListElement = function() {};

	FieldListElement.defaultOptions = {
		
	};

	FieldListElement.prototype = new FieldElement();

	FieldListElement.prototype.makeDom = function(forceMake) {

		if( ! forceMake && this.dom ) {
			this.updateDom( );
		}
		return (this._dom = this._makeDom() || $("<div />").addClass('field-list'));
	};


	FieldListElement.prototype.makeDuplicator = function() {
		
		var self = this;
		var plus = $("<span>+</span>").addClass('form-duplicator form-duplicator-add').on('click', function() {

			self.groupElement.duplicateFieldElement( self ).done( function() {
				self.groupElement.updateDom( );	
				self.inDom( );
			} );

		} );

		var minus = $( "<span>-</span>" ).addClass('form-duplicator form-duplicator-remove').on( 'click', function() {

			self.groupElement.removeFieldElement( self );
			self.groupElement.updateDom( );	

		} );

		this.duplicatorDom = $("<div />").addClass( 'form-duplicator-wrapper' ).append( plus ).append( minus );

		return this.duplicatorDom;
	}


	return FieldListElement;
});