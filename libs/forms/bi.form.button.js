
var BI = BI || {};
BI.Buttons = BI.Buttons || {};

BI.Buttons.Button = function(label, onClick) {
	if(label)
		this.title = new BI.Title(label);
	if(onClick)
		this.onClick = onClick;
	this.color = null;
	
	this.id = ++BI.Buttons.Button.prototype.absId;
	BI.Buttons.Button.prototype._buttons[this.id] = this;
}


BI.Buttons.Button.prototype = {
	
	_buttons: [],
	absId: 0,
	
	getId: function() {
		return this.id;
	},
	
	setTitle: function(title) {
		this.title = title;
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
		
		html += '" data-id="';
		html += this.id;
		html += '"><span>';
		html += this.title.getLabel();
		html += '</span></div>';
		return html;
	},
	
	doClick: function(event) {
		
		if(typeof this.onClick == "function")
			this.onClick(event);
	},
	
	getButtonById: function(id) {
		return BI.Buttons.Button.prototype._buttons[id];
	}
};



(function($) {
	
	$(document).on('click', '.bi-form-button', function(event) {
		var btnId = $(this).data('id');
		window[window._namespaces['buttons']].Buttons.Button.prototype.getButtonById(btnId).doClick(event);
	});
	
}) (jQuery);

