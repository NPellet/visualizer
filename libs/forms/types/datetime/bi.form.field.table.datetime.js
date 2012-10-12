
if(!BI.Forms.Fields.Table)
	BI.Forms.Fields.Table = {};

BI.Forms.Fields.Table.Datetime = function(main) {
	this.main = main;	
	this.divs = [];
}

BI.Forms.Fields.Table.Datetime.prototype = new BI.Forms.Fields.Datetime();

BI.Forms.Fields.Table.Datetime.prototype.initHtml = function() {
		
	var field = this;

	this.fillExpander();
	this._inputHours = this.main.domExpander.find('.bi-formfield-timehours').bind('keyup', function() { field._hasChanged(); });
	this._inputMinutes = this.main.domExpander.find('.bi-formfield-timeminutes').bind('keyup', function() { field._hasChanged(); });
	this._inputSeconds = this.main.domExpander.find('.bi-formfield-timeseconds').bind('keyup', function() { field._hasChanged(); });
	this._dateInstance = this.main.domExpander.find('.bi-formfield-datetime-picker').datepicker({
		onSelect: function() {
			field._hasChanged();
		}
	});
	
	this._aidSeconds = this.main.domExpander.find('.aig.seconds');
	this._aidMinutes = this.main.domExpander.find('.aig.minutes');
	this._aidHours = this.main.domExpander.find('.aig.hours');
};


BI.Forms.Fields.Table.Datetime.prototype._setValueText = function(index, date) {
	var str = this._addZero(date.getDate()) + " " + BI.lang.months["month_" + date.getMonth()] + " " + date.getFullYear() + " " + this._addZero(date.getHours()) + ":" + this._addZero(date.getMinutes()) + ":" + this._addZero(date.getSeconds());
	this.divs[index].html(str);  
	//this.main.fields[index].field.html(str);		
};



BI.Forms.Fields.Table.Datetime.prototype.addField = function(position) {
	var inst = this;
	var div = $("<div />").bind('click', function(event) {
		event.stopPropagation();
		inst.main.toggleExpander(position);
	});
	this.divs.splice(position, 0, div);
	return { field: div, html: div, index: position };
};
	
BI.Forms.Fields.Table.Datetime.prototype.removeField = function(position) {
	this.divs.splice(position, 1).remove();
};

BI.Forms.Fields.Table.Datetime.prototype.startEditing = function(position) {
	//this.main.toggleExpander(position);
};

BI.Forms.Fields.Table.Datetime.prototype.stopEditing = function(position, hasNew) {
	//this.divs[position].show().html(this.input.val());
	//this.input.remove();
//	this.main.changeValue(position, this.input.val());
	
		
}


