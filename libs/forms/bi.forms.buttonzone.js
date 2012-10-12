
if(!window[window._namespaces['buttons']].Buttons)
	window[window._namespaces['buttons']].Buttons = {};


window[window._namespaces['buttons']].Buttons.Zone = function(options) {
	this.buttons = {};	
	
	this.options = options;
	if(!this.options)
		this.options = {};
		
	this.hAlign = this.options.hAlign || 'left';
	this.vAlign = this.options.vAlign || 'vertical'
}

window[window._namespaces['buttons']].Buttons.Zone.prototype = {
	
	addButton: function(button) {
		this.buttons[button.getId()] = button;
	},
	
	render: function() {
		var html = '<div class="bi-buttonzone';
		
		if(this.hAlign) { 
			html += ' bi-align-';
			html += this.hAlign;
		}
		
		if(this.vAlign) {
			html += ' bi-valign-';
			html += this.vAlign;
		}
		
		html += '">';
		for(var i in this.buttons) {
			html += this.buttons[i].render();
		}
		
		html += '</div>';
		return html;
	},
	
	getButton: function(id) {
		return this.buttons[id];
	},
	
	setAlignment: function(align) {
		this.hAlign = align;
	},
	
	setVerticalAlignment: function(align) {
		this.vAlign = align;
	}
	
	
}

