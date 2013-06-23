define([], function() {

	var Element = function(data) {
		this.data = data;
		this.elements = [];	
	}

	Element.prototype = { 
		addElement: function(Element) {
			this.elements.push(Element);
		},
		
		getElements: function() {
			return this.elements;
		},
		
		hasElements: function() {
			return !!this.elements.length;
		}
	}

	return Element;
});