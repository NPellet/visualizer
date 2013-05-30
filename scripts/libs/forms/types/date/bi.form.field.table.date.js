
if(!BI.Forms.Fields.Table)
	BI.Forms.Fields.Table = {};

BI.Forms.Fields.Table.Date = function(main) {
	this.main = main;	
	this.divs = [];
}

BI.Forms.Fields.Table.Date.prototype = new BI.Forms.Fields.Date();



BI.Forms.Fields.Table.Date.prototype.buildHtml = function() {

}


BI.Forms.Fields.Table.Date.prototype.initHtml = function() {
	var field = this;
	this.fillExpander();
	this._dateInstance = this.main.domExpander.find('.bi-formfield-datetime-picker').datepicker({
		onSelect: function() {
			try {
				field._hasChanged();
			} catch(e) {
				console.log(e);
			}
		}
	}).bind('click', function(e) {
		e.stopPropagation();
	});		
};


BI.Forms.Fields.Table.Date.prototype.setText = function(index, text) {
	this.main.fieldContainer.children().eq(index).html(text);
};
	
BI.Forms.Fields.Table.Date.prototype.setText = function(index, value) {	
	this.divs[index].html(value);
//	this.main.changeValue(index, value);
}

BI.Forms.Fields.Table.Date.prototype.addField = function(position) {
	this._loadedCallback = [];
	var inst = this;
	var div = $("<div></div>");
	this.divs.splice(position, 0, div)
	return { field: div, html: div, index: position };
}

BI.Forms.Fields.Table.Date.prototype.removeField = function(position) {
	this.divs.splice(position, 1)[0].remove();
}

BI.Forms.Fields.Table.Date.prototype.startEditing = function(position) {
	this.currentIndex = position;
	
	this.main.toggleExpander(position);
};

BI.Forms.Fields.Table.Date.prototype.stopEditing = function(position) {
	this.main.hideExpander();
}

BI.Forms.Fields.Table.Date.prototype.expanderShowed = function(index) {
	
}


