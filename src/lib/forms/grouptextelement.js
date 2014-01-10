define(['jquery', './groupelement'], function($, GroupElement) {

	var GroupTextElement = function() {
		this.duplicators = [];
	};

	GroupTextElement.prototype = new GroupElement();
	


	GroupTextElement.prototype.fill = function( json, clearFirst ) {

		this.value = json;
		if( this.dom ) {
			this.dom.html( this.value );
		}

		return $.Deferred().resolve();
	},

	
	GroupTextElement.prototype.inDom = function() {},

	GroupTextElement.prototype.getFieldElement = function( fieldName, fieldId ) { },
	GroupTextElement.prototype._getElement = function(stack, getter, name, id) { },
	GroupTextElement.prototype.getFieldElements = function() { },
	GroupTextElement.prototype.eachFieldElements = function(fieldName, callback) { },


	GroupTextElement.prototype.makeDom = function(forceMake) {
		this.dom = $("<div />");
		
		if( this.value ) {
			this.dom.html( this.value );
		}
		
		return this.dom;
	};

	GroupTextElement.prototype._makeDomTpl = function() {

	}

	GroupTextElement.prototype.visible = function() {

	}

	GroupTextElement.prototype.updateDom = function() {	
		return this.dom;
	};

	GroupTextElement.prototype.makeDuplicator = function(rowId) {
		return;
	};

	GroupTextElement.prototype.duplicate = function(rowId) {

		
	};

	GroupTextElement.prototype.remove = function(rowId) {

	};

	GroupTextElement.prototype.getValue = function(stackFrom, stackTo) {

		return;
	};

	GroupTextElement.prototype.redoTabIndices = function() {}


	return GroupTextElement;
});