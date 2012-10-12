


if(!BI.Forms.Fields.Table)
	BI.Forms.Fields.Table = {};
	

BI.Forms.Fields.Table.Combo = function(main) {

	this.main = main;
	this.treeLoaded = false;
	this.divs = [];
	
	this.optionsIndexed = [];
	this.options;
	
	this._loadedCallback = [];
}

BI.Forms.Fields.Table.Combo.prototype = new BI.Forms.Fields.Combo();



BI.Forms.Fields.Table.Combo.prototype.buildHtml = function() {

}


BI.Forms.Fields.Table.Combo.prototype.initHtml = function() {
	this.loadTree();
};


BI.Forms.Fields.Table.Combo.prototype.setText = function(index, text) {
	this.main.fieldContainer.children().eq(index).html(text);
};
	
BI.Forms.Fields.Table.Combo.prototype.setText = function(index, value) {	
	this.divs[index].html(value);
//	this.main.changeValue(index, value);
}

BI.Forms.Fields.Table.Combo.prototype.addField = function(position) {
	this._loadedCallback = [];
	var inst = this;
	var div = $("<div></div>");
	this.divs.splice(position, 0, div)
	return { field: div, html: div, index: position };
}

BI.Forms.Fields.Table.Combo.prototype.removeField = function(position) {
	this.divs.splice(position, 1)[0].remove();
}

BI.Forms.Fields.Table.Combo.prototype.startEditing = function(position) {
/*	this.divs[position].hide().after(this.input.val(this.main.getValue(position)));
	this.input.focus();*/
	
	this.fillTree(position);
	this.currentIndex = position;
	this.main.toggleExpander(position);
};

BI.Forms.Fields.Table.Combo.prototype.stopEditing = function(position) {
/*	this.divs[position].show().html(this.input.val());
	this.input.remove();*/
	//this.main.changeValue(position, this.input.val());
	
	this.main.hideExpander();
}


BI.Forms.Fields.Table.Combo.prototype.expanderShowed = function(index) {
	
	if(this.optionsIndexed[index] !== undefined) {
	//	this.loadTree(index);
		this.fillTree(index);
	}
	
	
	tree = this.main.domExpander.children().dynatree("getTree");
	if(!tree.getActiveNode)
		return;
		
	var node;
	if((node = tree.getActiveNode()) != null)
		node.deactivate();
		
	if(tree.getNodeByKey && (node = tree.getNodeByKey(this.main.getValue(index)))) {
		node.activateSilently();
	}
}
