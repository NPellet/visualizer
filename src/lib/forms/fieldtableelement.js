
define(['./fieldelement'], function(FieldElement) {


	var FieldTableElement = function() {};

	FieldTableElement.defaultOptions = {
		
	};

	FieldTableElement.prototype = new FieldElement();

	FieldTableElement.prototype.makeDom = function(forceMake) {

/*
		if( ! forceMake && this.dom ) {
			this.updateDom( );
		}

		*/
		return (this._dom = this._dom || this._makeDom());
	}

	return FieldTableElement;

});