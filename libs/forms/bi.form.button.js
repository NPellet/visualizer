
if(!window[window._namespaces['buttons']].Buttons)
	window[window._namespaces['buttons']].Buttons = {};

window[window._namespaces['buttons']].Buttons.Button = function(label, onClick) {
	if(label)
		this.title = new window[window._namespaces['title']].Title(label);
	if(onClick)
		this.onClick = onClick;
	this.color = null;
	
	this.id = ++window[window._namespaces['buttons']].Buttons.Button.prototype.absId;
	window[window._namespaces['buttons']].Buttons.Button.prototype._buttons[this.id] = this;
}


window[window._namespaces['buttons']].Buttons.Button.prototype = {
	
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
	
	doClick: function() {
		
		if(typeof this.onClick == "function")
			this.onClick();
	},
	
	getButtonById: function(id) {
		return window[window._namespaces['buttons']].Buttons.Button.prototype._buttons[id];
	}
};



(function($) {
	
	$(document).on('click', '.bi-form-button', function() {
		var btnId = $(this).data('id');
		window[window._namespaces['buttons']].Buttons.Button.prototype.getButtonById(btnId).doClick();
	});
	
}) (jQuery);

