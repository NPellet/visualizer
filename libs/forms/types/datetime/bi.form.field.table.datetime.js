
if(!BI.Forms.Fields.Table)
	BI.Forms.Fields.Table = {};

BI.Forms.Fields.Table.Datetime = function(main) {
	this.main = main;	
	this.divs = [];
}

BI.Forms.Fields.Table.Datetime.prototype = new BI.Forms.Fields.Datetime();



BI.Forms.Fields.Table.Datetime.prototype.buildHtml = function() {

}


BI.Forms.Fields.Table.Datetime.prototype.initHtml = function() {

	var field = this;
	this.fillExpander();
	this._inputHours = this.main.domExpander.find('.bi-formfield-timehours').bind('keyup', function() { field._hasChanged(); }).bind('click', function(e) { e.stopPropagation() });
	this._inputMinutes = this.main.domExpander.find('.bi-formfield-timeminutes').bind('keyup', function() { field._hasChanged(); }).bind('click', function(e) { e.stopPropagation() });
	this._inputSeconds = this.main.domExpander.find('.bi-formfield-timeseconds').bind('keyup', function() { field._hasChanged(); }).bind('click', function(e) { e.stopPropagation() });

	this._dateInstance = this.main.domExpander.find('.bi-formfield-datetime-picker').datepicker({
		onSelect: function() {
			field._hasChanged();
		}
	}).bind('click', function(e) {
		e.stopPropagation();
	});
	
	this._aidSeconds = this.main.domExpander.find('.aig.seconds');
	this._aidMinutes = this.main.domExpander.find('.aig.minutes');
	this._aidHours = this.main.domExpander.find('.aig.hours');
};


BI.Forms.Fields.Table.Datetime.prototype.setText = function(index, text) {
	this.main.fieldContainer.children().eq(index).html(text);
};
	
BI.Forms.Fields.Table.Datetime.prototype.setText = function(index, value) {	
	this.divs[index].html(value);
//	this.main.changeValue(index, value);
}

BI.Forms.Fields.Table.Datetime.prototype.addField = function(position) {
	this._loadedCallback = [];
	var inst = this;
	var div = $("<div></div>");
	this.divs.splice(position, 0, div)
	return { field: div, html: div, index: position };
}

BI.Forms.Fields.Table.Datetime.prototype.removeField = function(position) {
	this.divs.splice(position, 1)[0].remove();
}

BI.Forms.Fields.Table.Datetime.prototype.startEditing = function(position) {
	this.currentIndex = position;
	this.main.toggleExpander(position);
};

BI.Forms.Fields.Table.Datetime.prototype.stopEditing = function(position) {
	this.main.hideExpander();
}


BI.Forms.Fields.Table.Datetime.prototype.expanderShowed = function(index) {
	
	var date = this.main.getValue(index);
	
	var date = new Date(date);
	this._inputMinutes.val(this._addZero(date.getMinutes()));
	this._inputHours.val(this._addZero(date.getHours()));
	this._inputSeconds.val(this._addZero(date.getSeconds()));
	
	
	this.setExpanderValue(date, date.getHours(), date.getMinutes(), date.getSeconds());
	
}


