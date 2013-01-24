
var BI = BI || {};
BI.Buttons = BI.Buttons || {};

BI.Buttons.Button = function(label, onClick, options) {
	
	this.title = new BI.Title(label || '');

	if(onClick)
		this.onClick = onClick;
	this.color = null;
	this.options = options || {};
	this.color = this.options.color || '';

	this.value = 0;
	this.disabled = false;
	
	this.id = ++BI.Buttons.Button.prototype.absId;
	BI.Buttons.Button.prototype._buttons[this.id] = this;
}


BI.Buttons.Button.prototype = {
	
	_buttons: {},
	absId: 0,
	
	getId: function() {
		return this.id;
	},
	
	setTitle: function(title) {
		this.title = title;
	},

	setLabel: function(label) {
		this.title.setLabel(label);
	},
	
	setOnClick: function(fct) {
		this.onClick = fct;
	},
	
	setColor: function(color) {
		this.color = color;
	},
	
	render: function() {

		var html = "";
		html += '<div class="bi-form-button';
		if(this.color !== null)
			html += ' ' + this.color; 

		if(this.disabled)
			html += ' disabled';

		html += '" data-id="';
		html += this.id;
		html += '" id="button-' + this.id + '"><span>';
		html += this.title.getLabel();
		html += '</span></div>';
		return html;
	},
	
	doClick: function(event, item) {
		this.value = !this.value;

		if(this.options.checkbox)
			item.toggleClass('bi-active');
		if(typeof this.onClick == "function")
			this.onClick(event, this.value, item);
	},
	
	getButtonById: function(id) {
		return BI.Buttons.Button.prototype._buttons[id];
	},

	getDom: function() {
		return $("#button-" + this.id);
	},

	disable: function() {
		this.disabled = true;
		$("#button-" + this.id).addClass('disabled');
	},

	enable: function() {
		this.disabled = false;
		$("#button-" + this.id).removeClass('disabled');	
	}
};



(function($) {
	
	$(document).on('click', '.bi-form-button', function(event) {
		var btnId = $(this).data('id');
		var btn = BI.Buttons.Button.prototype.getButtonById(btnId);
		if(btn)
			btn.doClick(event, $(this));
	});
	
}) (jQuery);
