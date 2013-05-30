if(!window[_namespaces['table']].Tables) window[_namespaces['table']].Tables = {};

window[_namespaces['table']].Tables.Element = function(data) {
	this.data = data;
	this.elements = [];
}


window[_namespaces['table']].Tables.Element.prototype = {
	
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
